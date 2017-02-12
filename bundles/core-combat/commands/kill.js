'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'Kill whom?');
      }

      if (player.isInCombat()) {
        return Broadcast.sayAt(player, "You're too busy fighting!");
      }

      const npc = Parser.parseDot(args, player.room.npcs);
      if (!npc) {
        return Broadcast.sayAt(player, "They aren't here.");
      }

      if (!npc.hasBehavior('combat')) {
        return Broadcast.sayAt(player, `${npc.name} is a pacifist and will not fight you.`);
      }

      player.combatData.lag = 0;
      player.combatData.roundStarted = Date.now();

      if (!npc.isInCombat()) {
        npc.combatData.lag = 2500; // give the player a 1 round advantage
        npc.combatData.roundStarted = Date.now();
      }

      player.addCombatant(npc);
      npc.addCombatant(player);
      Broadcast.sayAt(player, 'Started combat!');
    }
  };
};
