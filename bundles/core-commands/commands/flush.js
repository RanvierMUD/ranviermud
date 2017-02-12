'use strict';
const util  = require('util');

/**
 * Flush the command queue
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    command : (state) => (args, player) => {
      player.commandQueue.flush();
      Broadcast.sayAt(player, '<bold><yellow>Queue flushed.</yellow></bold>');
    }
  };
};
