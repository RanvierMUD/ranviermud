'use strict';

const util = require('util');

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    config: {
      name: 'Regenerate Health',
      description: "You are regenerating health over time.",
      stackable: false,
      type: 'regen.health',
      tickInterval: 3
    },
    state: {
      magnitude: 10,
      interval: 3,
      lastTick: -Infinity // always tick when first activated
    },
    listeners: {
      effectedAdded: function () {
        if (this.target.isInCombat()) {
          this.remove();
        }
      },

      eventActivated: function () {
        if (this.target.isInCombat()) {
          return;
        }

        Broadcast.sayAt(this.target, "Starting regeneration!");
        Broadcast.prompt(this.target);
      },

      eventDeactivated: function () {
        if (this.target.isInCombat()) {
          return;
        }

        Broadcast.sayAt(this.target, "Regen ended!");
        Broadcast.prompt(this.target);
      },

      updateTick: function () {
        const start = this.target.getAttribute('health');
        const max = this.target.getMaxAttribute('health');
        if (start >= max) {
          return this.remove();
        }

        this.target.raiseAttribute('health', this.state.magnitude);
      },

      combatStart: function () {
        this.remove();
      }
    }
  };
};
