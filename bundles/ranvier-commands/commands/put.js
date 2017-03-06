'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemType = require(srcPath + 'ItemType');

  return {
    usage: 'put <item> <container>',
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'Put what where?');
      }

      // put 3.foo in bar -> put 3.foo bar -> put 3.foo into bar
      const parts = args.split(' ').filter(arg => !arg.match(/in/) && !arg.match(/into/));

      if (parts.length === 1) {
        return Broadcast.sayAt(player, "Where do you want to put it?");
      }

      const fromList = player.inventory;
      const fromArg = parts[0];
      const toArg = parts[1];
      const item = Parser.parseDot(fromArg, fromList);
      const toContainer = Parser.parseDot(toArg, player.room.items);

      if (!item) {
        return Broadcast.sayAt(player, "You don't have that item.");
      }

      if (!toContainer) {
        return Broadcast.sayAt(player, "You don't see anything like that here.");
      }

      if (toContainer.type !== ItemType.CONTAINER) {
        return Broadcast.sayAt(player, `${toContainer.name} isn't a container.`);
      }

      if (toContainer.properties.maxItems && toContainer.inventory && toContainer.inventory.size >= toContainer.properties.maxItems) {
        return Broadcast.sayAt(player, `${toContainer.name} can't hold any more.`);
      }

      player.removeItem(item);
      toContainer.addItem(item);

      Broadcast.sayAt(player, `<green>You put </green>${item.display}<gree> into </green>${toContainer.display}<green>.</green>`);

      item.emit('put', player, toContainer);
      player.emit('put', item, toContainer);
    }
  };
};
