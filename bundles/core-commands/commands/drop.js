'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'Drop what?');
      }

      if (!player.room) {
        return Broadcast.sayAt(player, 'You are floating in the nether, it would disappear forever.');
      }

      // get 3.foo from bar -> get 3.foo bar
      const parts = args.split(' ').filter(arg => !arg.match(/from/));

      let source = null, search = null;
      if (parts.length === 1) {
        search = parts[0];
        source = player.inventory;
      } else {
        // TODO
        return Broadcast.sayAt(player, 'Getting items from containers is not yet supported');
      }

      const item = Parser.parseDot(search, source);

      if (!item) {
        return Broadcast.sayAt(player, "You aren't carrying anything like that.");
      }

      player.removeItem(item);
      player.room.addItem(item);
      player.emit('drop', item);
      for (const npc of player.room.npcs) {
        npc.emit('playerDropItem', player, item);
      }

      Broadcast.sayAt(player, `Dropped: ${item.name}`);
    }
  };
};

