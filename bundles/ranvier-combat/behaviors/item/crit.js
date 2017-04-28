'use strict';

/**
 * Configureable critical hit behavior.
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');

  return  {
    listeners: {
      hit: state => function (config = {}, damage, target) {
        const { chance = 1, multiplier = 1.5 } = config;
        /*
          1. check for crit
          2. config should have crit chance and multiplier (default 1.5x)
            { chance: 2, multiplier: 1.7 }
          3. check for additional crit chance & multis due to skills (eventually)
          4. deal new damage. damage * (multiplier - 1)
          5. could also allow for things like crits doing healing, or dealing a
             specific type of damage rather than plain phys damage.
        */
      }
    }
  };
};
