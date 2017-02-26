'use strict';

/**
 * Dummy effect used to enforce skill cooldowns
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
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
};

