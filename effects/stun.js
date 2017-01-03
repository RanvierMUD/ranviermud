'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  ({ factor   = 2, duration = 10 * 1000 }, target) => ({
      
      activate() {
        const name = 'stunned';

        target.combat.addSpeedMod({ name,
          effect: speed => Math.max(speed * factor, 10 * 1000)
        });

        target.combat.addDodgeMod({ name,
          effect: dodge => 0
        });

        target.combat.addToHitMod({ name,
          effect: toHit => toHit / (factor * 2)
        });

      },
      
      deactivate() { target.combat.removeAllMods('stunned'); },

      modifiers: {
        energy:     energy     => energy     / factor,
        max_energy: max_energy => max_energy / factor,
      },

      type: 'stun',
      name: 'Stunned',
      desc: 'You are dazed, finding it difficult to move or react.',
      aura: 'uselessness'
  });
