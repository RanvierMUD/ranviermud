'use strict';

const { Broadcast, EffectFlag } = require('ranvier');

module.exports = {
  config: {
    name: 'Potion Buff',
    type: 'potion.buff',
    refreshes: true,
  },
  flags: [EffectFlag.BUFF],
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
    effectRefreshed: function (newEffect) {
      this.startedAt = Date.now();
      Broadcast.sayAt(this.target, "You refresh the potion's magic.");
    },

    effectActivated: function () {
      Broadcast.sayAt(this.target, "You drink down the potion and feel more powerful!");
    },

    effectDeactivated: function () {
      Broadcast.sayAt(this.target, "You feel less powerful.");
    }
  }
};

