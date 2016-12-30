'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  ({ cost = 1 } , target) => {
    return {
      activate() {},
      deactivate() {},

      modifiers: {
        stamina: stamina => Math.max(1, stamina - cost) 
      },

      type: 'weakness',
      name: 'Recovering from physical exertion',
      aura: 'exhaustion'
    };
  }
