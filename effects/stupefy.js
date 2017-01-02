'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  ({ combatModName = 'stupefaction',
     name = "Stupefied",
     aura = "stupefaction",
     percentage = 0.5,
     cost       = 1,
     desc       = 'You are distracted and unfocused due to stress.' 
  } , target) => {
    return {
      activate() {
        target.combat.addToHitMod({
          name: combatModName,
          effect: toHit => toHit * percentage
        });
        target.combat.addDodgeMod({
          name: combatModName,
          effect: dodge => dodge * percentage
        });      
      },
      deactivate() {
        target.combat.removeAllMods(combatModName);
      },

      modifiers: {
        cleverness: cleverness => Math.max(1, cleverness - cost) 
      },

      type: 'stupefy',
      name,
      aura,
      desc
    };
  }
