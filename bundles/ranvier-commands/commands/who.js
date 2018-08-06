'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'who',
	aliases: ['кто'],
    command: (state) => (args, player) => {
      Broadcast.sayAt(player, "<bold><red>                  Кто онлайн</bold></red>");
      Broadcast.sayAt(player, "<bold><red>===============================================</bold></red>");
      Broadcast.sayAt(player, '');

      state.PlayerManager.players.forEach((otherPlayer) => {
        Broadcast.sayAt(player, ` *  ${otherPlayer.name} ${getRoleString(otherPlayer.role)}`);
      });

      Broadcast.sayAt(player, state.PlayerManager.players.size + ' total');

      function getRoleString(role = 0) {
        return [
          '',
          '<white>[Билдер]</white>',
          '<b><white>[Бессмертный]</white></b>'
        ][role] || '';
      }
    }
  };
};
