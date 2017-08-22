'use strict';

/**
 * Effect applied by Judge skill. Reduces damage done.
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');
  const Heal = require(srcPath + 'Heal');

  return {
    config: {
      name: 'Judged',
      description: 'Damage of your next attack is reduced.',
      type: 'skill:judge',
    },
    flags: [Flag.DEBUFF],
    state: {
      reductionPercent: 0
    },
    modifiers: {
      incomingDamage: (damage, current) => current,
      outgoingDamage: function (damage, currentAmount) {
        if (damage instanceof Heal || damage.attribute !== 'health') {
          return currentAmount;
        }

        const reduction = Math.round(currentAmount * (this.state.reductionPercent / 100));
        return currentAmount - reduction;
      },
    },
    listeners: {
      effectActivated: function () {
        Broadcast.sayAt(this.target, '<yellow>The holy judgement weakens you.</yellow>');
      },

      effectDeactivated: function () {
        Broadcast.sayAt(this.target, '<yellow>You feel your strength return.</yellow>');
      },

      hit: function () {
        this.remove();
      }
    }
  };
};
