'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'Kill whom?');
      }

      const npc = Parser.parseDot(args, player.room.npcs);
      if (!npc) {
        return Broadcast.sayAt(player, "They aren't here.");
      }

      util.log(`KILL: Player [${player.name}] -> [${npc.name}]`);
      player.addCombatant(npc);
      npc.addCombatant(player);
      Broadcast.sayAt(player, 'Started combat!');
    }
  };
};

