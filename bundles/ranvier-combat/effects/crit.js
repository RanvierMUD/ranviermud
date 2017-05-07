'use strict';

/**
 * Generic effect used for weapon or ability crit calculation
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');
  const Random = require(srcPath + 'RandomUtil');

  return {
    config: {
      name: 'Critical',
      description: '',
      type: 'crit',
      hidden: true,
      unique: false
    },
    flags: [Flag.BUFF],
    state: {
      chance: 1,
      multiplier: 1.5
    },
    modifiers: {
      criticalChance(damage) {
        return damage.critical || Random.probability(this.state.chance);
      },
      outgoingDamage(damage, current) {
        if (!damage.critical) {
          return current;
        }

        return current * this.state.multiplier;
      }
    },
    listeners: {
      unequip(slot, item) {
        if (slot === this.state.slot) {
          this.remove();
        }
      },
    }
  };
};
