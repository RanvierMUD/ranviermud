'use strict';

const { Broadcast } = require('ranvier');

/**
 * Dummy effect used to enforce skill cooldowns
 */
module.exports = {
  config: {
    name: 'Cooldown',
    description: 'Cannot use ability while on cooldown.',
    unique: false,
    type: 'cooldown',
  },
  state: {
    cooldownId: null
  },
  listeners: {
    effectDeactivated: function () {
      Broadcast.sayAt(this.target, `You may now use <bold>${this.skill.name}</bold> again.`);
    }
  }
};
