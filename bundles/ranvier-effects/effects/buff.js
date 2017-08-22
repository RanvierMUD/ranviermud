'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Buff Strength',
      description: "You feel stronger!",
      duration: 30 * 1000,
      type: 'buff.strength',
    },
    flags: [Flag.BUFF],
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
};
