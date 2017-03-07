'use strict';


/**
 * Login is done, allow the player to actually execute commands
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    event: state => (socket, args) => {
      let player = args.player;
      player.hydrate(state);

      player.socket.on('close', () => {
        Logger.log(player.name + ' has gone linkdead.');
        // TODO: try to fetch the person the player is fighting and dereference the player
        //if (player.inCombat.inCombat) {
        //  player.inCombat.inCombat = null;
        //}

        player.save(() => {
          player.room.removePlayer(player);
          state.PlayerManager.removePlayer(player, true);
        });
      });

      state.CommandManager.get('look').execute(null, player);

      player.room.emit('playerEnter', player);
      for (const npc of player.room.npcs) {
        npc.emit('playerEnter', player);
      }

      Broadcast.prompt(player);

      // All that shit done, let them play!
      player.socket.emit('commands', player);
    }
  };
};
