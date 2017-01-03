'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  ({ cost = 1 } , target) => {
    const debuff = stat => Math.max(1, stat - cost);
    return {
      activate: () => {},

      modifiers: {
        quickness:  debuff,
        willpower:  debuff,
        stamina:    debuff,
        cleverness: debuff
      },

      deactivate: () => {},
      type: 'debuff',
      name: 'Drained abilities',
      desc: 'Temporary loss of ability',
      aura: 'ruined'
    };
  }
