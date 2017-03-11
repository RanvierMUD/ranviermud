'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    aliases: ['attack', 'slay'],
    command : (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'Kill whom?');
      }

      let target = null;
      try {
        target = player.findCombatant(args);
      } catch (e) {
        return Broadcast.sayAt(player, e.message);
      }

      if (!target) {
        return Broadcast.sayAt(player, "They aren't here.");
      }

      Broadcast.sayAt(player, `You attack ${target.name}.`);

      player.initiateCombat(target);
      Broadcast.sayAtExcept(player.room, `${player.name} attacks ${target.name}!`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `${player.name} attacks you!`);
      }
    }
  };
};
