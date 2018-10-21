'use strict';

const { Broadcast, EffectFlag } = require('ranvier');

module.exports = {
  config: {
    name: 'Buff Strength',
    description: "You feel stronger!",
    duration: 30 * 1000,
    type: 'buff.strength',
  },
  flags: [EffectFlag.BUFF],
  state: {
    magnitude: 5
  },
  modifiers: {
    attributes: {
      strength: function (current) {
        return current + this.state.magnitude;
      }
    }
  },
  listeners: {
    effectActivated: function () {
      Broadcast.sayAt(this.target, "Strength courses through your veins!");
    },

    effectDeactivated: function () {
      Broadcast.sayAt(this.target, "You feel weaker.");
    }
  }
};
