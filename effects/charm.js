'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  (options, target) => ({
      activate() {
        const combatants = target.getInCombat();
        combatants.forEach(combatant => {
          combatant.removeFromCombat(target);
          target.say('${combatant.getShortDesc()} stops fighting you.');
        });
        target.fleeFromCombat();
      },
      
      deactivate() {},

      type: 'charm',
      name: 'Charm',
      desc: 'You radiate a charming aura that prevents normally aggressive enemies from attacking you.',
      aura: 'charming'
  });
