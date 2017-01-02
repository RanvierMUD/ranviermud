'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  ({ bonus = 1, multiplier = 1 } , target) => {
    return {
      activate() {},

      modifiers: {
        quickness: quickness => (quickness * multiplier) + bonus
      },

      deactivate() {},
      type: 'haste',
      name: 'Hasted',
      desc: 'You are moving faster than usual.',
      aura: 'sluggishness'
    };
  }