'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'who',
    command: (state) => (args, player) => {
      Broadcast.sayAt(player, "<bold><red>                  Who's Online</bold></red>");
      Broadcast.sayAt(player, "<bold><red>===============================================</bold></red>");
      Broadcast.sayAt(player, '');

      state.PlayerManager.players.forEach((otherPlayer) => {
        Broadcast.sayAt(player, ` *  ${otherPlayer.name} ${getRoleString(otherPlayer.role)}`);
      });

      Broadcast.sayAt(player, state.PlayerManager.players.size + ' total');

      function getRoleString(role = 0) {
        return [
          '',
          '<white>[Builder]</white>',
          '<b><white>[Admin]</white></b>'
        ][role] || '';
      }
    }
  };
};
