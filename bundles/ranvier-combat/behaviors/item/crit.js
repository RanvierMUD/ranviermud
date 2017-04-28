'use strict';

/**
 * Configureable critical hit behavior.
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');
  const Damage = require(srcPath + 'Damage');
  return  {
    listeners: {
      hit: state => function (config = {}, damage, target) {
        if (!damage.attacker) {
          return;
        }

        /*
          1. check for crit
          2. config should have crit chance and multiplier (default 1.5x)
            { chance: 2, multiplier: 1.7 }
          3. check for additional crit chance & multis due to skills (eventually)
          4. deal new damage. damage * (multiplier - 1)
          5. could also allow for things like crits doing healing, or dealing a
             specific type of damage rather than plain phys damage.
        */

        const { chance = 1, multiplier = 1.5, attribute } = config;

        if (Random.probability(chance)) {
          const critDamage = new Damage({
            attribute: attribute || damage.attribute,
            amount: ((damage.amount || 0) * (multiplier - 1)),
            attacker: damage.attacker,
            source: damage.sources,
            hidden: damage.hidden
          });
          critDamage.commit(target);
          Broadcast.sayAt(target, `<bold>You've been critically hit by ${damage.attacker ? damage.attacker.name : 'something'}!</bold>`);
          if (damage.attacker && !damage.attacker.isNpc) {
            Broadcast.sayAt(damage.attacker, `<bold>You critically strike ${target.name}!</bold>`);
          }
        }
      }
    }
  };
};
