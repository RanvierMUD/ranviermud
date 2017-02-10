'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    aliases: [ "affects" ],
    command : (state) => (args, player) => {
      Broadcast.sayAt(player, "Current Effects:");

      const effects = player.effects.entries().filter(effect => {
        return !effect.config.hidden;
      });

      if (!effects.length) {
        return Broadcast.sayAt(player, "  None.");
      }

      for (const effect of effects) {
        Broadcast.at(player, `  ${effect.name}: `);
        if (effect.duration === Infinity) {
          Broadcast.sayAt(player, "Permanent");
        } else {
          Broadcast.sayAt(player, ` ${effect.remaining} seconds remaining`);
        }
        Broadcast.sayAt(player, "\t" + effect.description);
      }
    }
  };
};
