'use strict';

/**
 * Flush the command queue
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'flush',
    command : (state) => (args, player) => {
      player.commandQueue.flush();
      Broadcast.sayAt(player, '<bold><yellow>Queue flushed.</yellow></bold>');
    }
  };
};
