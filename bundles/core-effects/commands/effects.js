'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : (state) => (args, player) => {
      Broadcast.sayAt(player, "Current Effects:");

      if (!player.effects.size) {
        return Broadcast.sayAt(player, "  None.");
      }

      for (const [effect] of player.effects.entries()) {
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



