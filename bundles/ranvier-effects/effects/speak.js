'use strict';

/**
 * Have an NPC speak phrases over time
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    config: {
      name: 'Speaking',
      type: 'speaking',
      tickInterval: 3,
      persists: false
    },
    state: {
      messageList: [],
      remainingMessages: [],
      outputFn: null
    },
    listeners: {
      effectActivated: function () {
        if (typeof this.state.outputFn !== 'function') {
          throw new Error('Speak effect has no outputFn configured');
        }

        // copy original message list to remainingMessages
        this.state.remainingMessages = this.state.messageList.concat([]);
      },

      updateTick: function () {
        if (!this.state.remainingMessages.length) {
          return this.remove();
        }

        const message = this.state.remainingMessages.shift();
        this.state.outputFn(message);
      },
    }
  };
};
