'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command: (state) => (args, player) => {
      Broadcast.sayAt(player, "<bold><red>                  Who's Online</bold></red>");
      Broadcast.sayAt(player, "<bold><red>===============================================</bold></red>");
      Broadcast.sayAt(player, '');

      let numPlayers = 0;
      state.PlayerManager.players.forEach((otherPlayer) => {
        numPlayers++;
        Broadcast.sayAt(player, ' * ' + otherPlayer.name);
      });

      Broadcast.sayAt(player, numPlayers + ' total');
    }
  };
};
