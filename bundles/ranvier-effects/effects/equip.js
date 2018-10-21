'use strict';

const { EffectFlag } = require('ranvier');

/**
 * Generic effect used for equipment's stats
 */
module.exports = {
  config: {
    name: 'Equip',
    description: '',
    type: 'equip',
    hidden: true,
  },
  flags: [EffectFlag.BUFF],
  state: {
    slot: null,
    stats: {}
  },
  modifiers: {
    attributes: function (attribute, current) {
      if (!(attribute in this.state.stats)) {
        return current;
      }

      return current + this.state.stats[attribute];
    }
  },
  listeners: {
    unequip: function (slot, item) {
      if (slot === this.state.slot) {
        this.remove();
      }
    },
  }
};
