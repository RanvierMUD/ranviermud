'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');

  return {
    usage: 'возврат',
	aliases: ['возврат'],
    command: state => (args, player) => {
      const home = player.getMeta('waypoints.home');
      if (!home) {
        return B.sayAt(player, 'У вас нет настроенной дороги домой.');
      }

      B.sayAt(player, '<b><cyan>Вы помолились богам, чтобы вы вернулись домой, и вас окружил яркий голубой свет.</cyan></b>');
      B.sayAtExcept(player.room, `<b><cyan>${player.name} пропадает во вспышке голубого света.</cyan></b>`, [player]);

      const nextRoom = state.RoomManager.getRoom(home);
      player.moveTo(nextRoom, _ => {
        state.CommandManager.get('look').execute('', player);

        B.sayAt(player, '<b><cyan>The blue light dims and you find yourself at the wayshrine.</cyan></b>');
        B.sayAtExcept(player.room, `<b><cyan>The waypiller glows brightly and ${player.name} appears in a flash of blue light.</cyan></b>`, [player]);
      });
    }
  };
};
