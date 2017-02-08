'use strict';

const util = require('util');

exports.effect = (players, items, npcs, rooms, Commands) =>
  ({
    attribute  = 'health',
    regenEvent = 'tick',
    interval   = 1,
    bonus      = 1
  }, target) => {
    let currentInterval = 0;

    return {
      activate() {},
      deactivate() {},

      events: {
        [regenEvent]: () => {
          currentInterval++;
          if (currentInterval % interval === 0) {
            const startingAttribute = target.getAttribute(attribute);
            const maximum           = target.getMaxAttribute(attribute);
            if (startingAttribute === maximum) { return; }

            const regenAttribute = Math.min(maximum, startingAttribute + bonus);
            target.raiseAttribute(attribute, regenAttribute);
          }
        },
      },

      type: 'regen',
      name: `Regenerating ${attribute}`,
      aura: 'regeneration'
    };
  }
