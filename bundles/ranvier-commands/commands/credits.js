'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command: state => (args, player) => {
      player.socket.command('sendAudio', 'levelup');
      state.CommandManager.get('help').execute('credits', player);
    }
  };
};
