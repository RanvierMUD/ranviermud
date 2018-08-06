'use strict';

/**
 * Flush the command queue
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'flush',
	aliases: ["~"],
    command : (state) => (args, player) => {
      player.commandQueue.flush();
      Broadcast.sayAt(player, '<bold><yellow>Очередь стерта.</yellow></bold>');
    }
  };
};
