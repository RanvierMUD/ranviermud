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
    },
    state: {
      magnitude: 10
    },
    listeners: {
      eventActivated: function () {
        Broadcast.sayAt(this.target, "Starting regeneration!");
        Broadcast.prompt(this.target);
      },

      eventDeactivated: function () {
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
        Broadcast.prompt(this.target);
      }
    }
  };
};
