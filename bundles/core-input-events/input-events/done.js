'use strict';

const util = require('util');

/**
 * Login is done, allow the player to actually execute commands
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    event: state => (socket, args) => {
      let player = args.player;
      player.hydrate(state);

      player.socket.on('close', () => {
        util.log(player.name + ' has gone linkdead.');
        // try to fetch the person the player is fighting and dereference the player
        if (player.inCombat.inCombat) {
          player.inCombat.inCombat = null;
        }

        player.save(() => {
          player.room.removePlayer(player);
          state.PlayerManager.removePlayer(player, true);
        });
      });

      state.CommandManager.get('look').execute(null, player);
      Broadcast.prompt(player);

      // All that shit done, let them play!
      player.socket.emit('commands', player);
    }
  };
};
