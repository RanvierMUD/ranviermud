'use strict';

const util = require('util');

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
    },
    flags: [Flag.DEBUFF],
    listeners: {
      eventActivated: function () {
        Broadcast.sayAt(this.target, "<bold><red>You've suffered a deep wound, it's bleeding profusely</red></bold>");
      },

      eventDeactivated: function () {
        Broadcast.sayAt(this.target, "Your wound has stopped bleeding.");
      },

      updateTick: function () {
        const amount = this.state.totalDamage / Math.round((this.config.duration / 1000) / this.config.tickInterval);

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
