'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  (options, target) => {
    util.log("LOL");
    return {
      activate: () => {},
      deactivate: () => {},
      type: 'stun',
    };
  }
