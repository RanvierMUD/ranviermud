'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) => 
  ({ 
    attribute = 'health', 
    event     = 'tick', 
    isFeat    = false,  
    interval  = 20,
    bonus     = 1,
  } , target) => {
    let currentInterval = 0;
    return {

      activate() {},
      deactivate() {},

      events: {
        [event]: () => {
          currentInterval++;
          if (currentInterval % interval === 0) {
            const startingAttribute = target.getRawAttribute(attribute);
            const maximum           = target.getRawAttribute(`max_${attribute}`);
            if (startingAttribute === maximum) { return; }

            const regenAttribute = Math.min(maximum, startingAttribute + bonus);
            player.setAttribute(attribute, regenAttribute);
          }
        }
      },

      type: 'weakness',
      name: 'Recovering from physical exertion',
      aura: 'exhaustion'
    };
  }
