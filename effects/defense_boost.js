'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  ({ combatModName = "defense boost", 
     name          = "Shielded",
     aura          = "basic protection",
     defenseBonus  = 2, 
     healthBonus   = 10,
     duration      = 10 * 1000 
   }, target) => ({
      
      activate() {
        
        target.combat.addDefenseMod({ 
          name:   combatModName,
          effect: defense => defense + defenseBonus
        });

      },
      
      deactivate() { target.combat.removeAllMods(combatModName); },

      modifiers: {
        health:     health     => health     + healthBonus,
        max_health: max_health => max_health + healthBonus,
      },

      type: 'defense_boost',
      name, aura
  });
