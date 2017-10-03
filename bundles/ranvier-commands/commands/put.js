'use strict';

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemType = require(srcPath + 'ItemType');
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    usage: 'put <item> <container>',
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return B.sayAt(player, 'Put what where?');
      }

      // put 3.foo in bar -> put 3.foo bar -> put 3.foo into bar
      const parts = args.split(' ').filter(arg => !arg.match(/in/) && !arg.match(/into/));

      if (parts.length === 1) {
        return B.sayAt(player, "Where do you want to put it?");
      }

      const fromList = player.inventory;
      const fromArg = parts[0];
      const toArg = parts[1];
      const item = Parser.parseDot(fromArg, fromList);
      const toContainer = Parser.parseDot(toArg, player.room.items) ||
                          Parser.parseDot(toArg, player.inventory) ||
                          Parser.parseDot(toArg, player.equipment);

      if (!item) {
        return B.sayAt(player, "You don't have that item.");
      }

      if (!toContainer) {
        return B.sayAt(player, "You don't see anything like that here.");
      }

      if (toContainer.type !== ItemType.CONTAINER) {
        return B.sayAt(player, `${ItemUtil.display(toContainer)} isn't a container.`);
      }

      if (toContainer.isInventoryFull()) {
        return B.sayAt(player, `${ItemUtil.display(toContainer)} can't hold any more.`);
      }

      if (toContainer.closed) {
        return B.sayAt(player, `${ItemUtil.display(toContainer)} is closed.`);
      }

      player.removeItem(item);
      toContainer.addItem(item);

      B.sayAt(player, `<green>You put </green>${ItemUtil.display(item)}<green> into </green>${ItemUtil.display(toContainer)}<green>.</green>`);

      item.emit('put', player, toContainer);
      player.emit('put', item, toContainer);
    }
  };
};
