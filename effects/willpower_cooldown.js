'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  ({ cost = 1 } , target) => {
    return {
      activate: () => {},

      modifiers: {
        willpower: willpower => Math.max(1, willpower - cost) 
      },

      deactivate: () => {},
      type: 'willpower_cooldown',
      name: 'Drained willpower',
      desc: 'Recovering from use of psionic willpower',
      aura: 'drained'
    };
  }
