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

      let fromList = player.inventory, fromArg = parts[0], item = null, toContainer = null, toArg = parts[1];

      toContainer = Parser.parseDot(toArg, player.room.items);
      item = Parser.parseDot(fromArg, fromList);

      if (!item) {
        return Broadcast.sayAt(player, "You don't have that item.");
      }

      if (!toContainer) {
        return Broadcast.sayAt(player, "You don't see anything like that here.");
      }

      if (toContainer.type !== ItemType.CONTAINER) {
          return Broadcast.sayAt(player, `${toContainer.name} isn't a container.`);
      }

      if (toContainer.attributes.maxItems && toContainer.inventory && toContainer.attributes.maxItems === toContainer.inventory.size) {
        return Broadcast.sayAt(player, `${toContainer.name} has reached it's limit.`);
      }

      toContainer.addItem(item);
      player.removeItem(item);

      Broadcast.sayAt(player, `You put a ${item.name} into the ${toContainer.name}`);

      item.emit('put', player);
      player.emit('put', item);

    }
  };
};
