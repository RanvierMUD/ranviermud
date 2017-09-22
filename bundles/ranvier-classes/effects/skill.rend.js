'use strict';

/**
 * Implementation effect for a Rend damage over time skill
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Rend',
      type: 'skill:rend',
      maxStacks: 3,
    },
    flags: [Flag.DEBUFF],
    listeners: {
      effectStackAdded: function (newEffect) {
        // add incoming rend's damage to the existing damage but don't extend duration
        this.state.totalDamage += newEffect.state.totalDamage;
      },

      effectActivated: function () {
        Broadcast.sayAt(this.target, "<bold><red>You've suffered a deep wound, it's bleeding profusely</red></bold>");
      },

      effectDeactivated: function () {
        Broadcast.sayAt(this.target, "Your wound has stopped bleeding.");
      },

      updateTick: function () {
        const amount = Math.round(this.state.totalDamage / Math.round((this.config.duration / 1000) / this.config.tickInterval));

        const damage = new Damage({
          attribute: "health",
          amount,
          attacker: this.attacker,
          source: this
        });
        damage.commit(this.target);
      },

      killed: function () {
        this.remove();
      }
    }
  };
};
