'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Regenerate Health',
      description: "You are regenerating health over time.",
      type: 'regen.health',
      tickInterval: 3
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 10,
    },
    listeners: {
      effectedAdded: function () {
        if (this.target.isInCombat()) {
          this.remove();
        }
      },

      updateTick: function () {
        const start = this.target.getAttribute('health');
        const max = this.target.getMaxAttribute('health');
        if (start >= max) {
          return this.remove();
        }

        const heal = new Heal({
          attribute: "health",
          amount: this.state.magnitude,
          attacker: this.target,
          source: this,
          hidden: true,
        });
        heal.commit(this.target);
      },

      combatStart: function () {
        this.remove();
      }
    }
  };
};
