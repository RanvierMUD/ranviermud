'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Potion Buff',
      type: 'potion.buff',
    },
    flags: [Flag.BUFF],
    state: {
      stat: "strength",
      magnitude: 1
    },
    modifiers: {
      attributes: function (attribute, current) {
        if (attribute !== this.state.stat) {
          return current;
        }

        return current + this.state.magnitude;
      }
    },
    listeners: {
      effectActivated: function () {
        Broadcast.sayAt(this.target, "You drink down the potion and feel more powerful!");
      },

      effectDeactivated: function () {
        Broadcast.sayAt(this.target, "You feel less powerful.");
      }
    }
  };
};

