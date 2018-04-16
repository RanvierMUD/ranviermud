'use strict';

/**
 * Example weapon hit script
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');
  const Heal = require(srcPath + 'Heal');

  return  {
    listeners: {
      hit: state => function (damage, target) {
        if (!damage.attacker || damage.attacker.isNpc) {
          return;
        }

        // Have to be careful in weapon scripts. If you have a weapon script that causes damage and
        // it listens for the 'hit' event you will have to check to make sure that `damage.source
        // !== this` otherwise you could create an infinite loop the weapon's own damage triggering
        // its script

        if (Random.probability(50)) {
          const amount = damage.critical ?
            damage.attacker.getMaxAttribute('health') :
            Math.floor(damage.finalAmount / 4);

          const heal = new Heal({
            attribute: 'health',
            amount,
            source: this,
            attacker: damage.attacker
          });

          Broadcast.sayAt(damage.attacker, `<b><white>The Blade of Ranvier shines with a bright white light and you see wisps of ${target.name}'s soul flow into the blade.</white></b>`, 80);
          heal.commit(damage.attacker);
        }
      }
    }
  };
};
