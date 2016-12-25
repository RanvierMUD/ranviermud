'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  (options, target) => {
    util.log("Stun attempt:");
    return {
      activate: () => {
        const {
          factor          = 2,
          duration        = 10 * 1000,
        } = options;

        const name = 'stunned';

        target.combat.addSpeedMod({ name,
          effect: speed => speed * factor
        });

        target.combat.addDodgeMod({ name,
          effect: dodge => 0
        });

        target.combat.addToHitMod({
          name,
          effect: toHit => toHit / factor
        });

      },

      modifiers: {
        energy:     energy     => energy     / factor,
        max_energy: max_energy => max_energy / factor,
      },

      deactivate: () => target.combat.removeAllMods('stunned'),
      type: 'stun',
      name: 'Stunned',
      aura: 'uselessness'
    };
  }
