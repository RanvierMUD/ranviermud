'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemType = require(srcPath + 'ItemType');

  return {
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'Get what?');
      }

      if (!player.room) {
        return Broadcast.sayAt(player, 'You are floating in the nether, there is nothing to get.');
      }

      // get 3.foo from bar -> get 3.foo bar
      const parts = args.split(' ').filter(arg => !arg.match(/from/));

      let source = null, search = null, container = null;
      if (parts.length === 1) {
        search = parts[0];
        source = player.room.items;
      } else {
        container = Parser.parseDot(parts[1], player.room.items);
        if (!container) {
          return Broadcast.sayAt(player, "You don't see anything like that here.");
        }

        if (container.type !== ItemType.CONTAINER) {
          return Broadcast.sayAt(player, `${container.name} isn't a container.`);
        }

        search = parts[0];
        source = container.inventory;
      }

      const item = Parser.parseDot(search, source);

      if (!item) {
        return Broadcast.sayAt(player, "You don't see anything like that here.");
      }

      if (item.attributes.noPickup) {
        return Broadcast.sayAt(player, `${item.name} can't be picked up.`);
      }

      if (container) {
        container.removeItem(item);
      } else {
        player.room.removeItem(item);
      }
      player.addItem(item);

      Broadcast.sayAt(player, `Picked up: ${item.name}`);
      item.emit('get', player);
      player.emit('get', item);
    }
  };
};
