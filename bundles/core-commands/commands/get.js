'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

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

      let source = null, search = null;
      if (parts.length === 1) {
        search = parts[0];
        source = player.room.items;
      } else {
        // TODO
        return Broadcast.sayAt(player, 'Getting items from containers is not yet supported');
      }

      const item = Parser.parseDot(search, source);

      if (!item) {
        return Broadcast.sayAt(player, "You don't see anything like that here.");
      }

      player.room.removeItem(item);
      player.addItem(item);

      Broadcast.sayAt(player, `Picked up: ${item.name}`);
      item.emit('get', player);
      player.emit('get', item);
    }
  };
};
