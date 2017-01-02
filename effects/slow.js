'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  ({ cost = 1, divisor = 1 } , target) => {
    return {
      activate() {},

      modifiers: {
        quickness: quickness => Math.max(1, (quickness / divisor) - cost) 
      },

      deactivate() {},
      type: 'slow',
      name: 'Slowed',
      desc: 'You are moving sluggishly.',
      aura: 'sluggishness'
    };
  }
