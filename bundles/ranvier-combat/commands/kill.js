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

      const possibleTargets = [
        ...player.room.npcs,
        ...player.room.players
      ];

      const target = Parser.parseDot(args, possibleTargets);
      if (!target) {
        return Broadcast.sayAt(player, "They aren't here.");
      }

      if (target.hasBehavior && target.hasBehavior('pacifist')) {
        return Broadcast.sayAt(player, `${target.name} is a pacifist and will not fight you.`);
      }

      player.combatData.lag = 0;
      player.combatData.roundStarted = Date.now();

      if (!target.isInCombat()) {
        target.combatData.lag = 2500; // give the attacker a 1 round advantage
        target.combatData.roundStarted = Date.now();
      }

      player.addCombatant(target);
      target.addCombatant(player);
      Broadcast.sayAt(player, 'Started combat!');
    }
  };
};
