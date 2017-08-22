'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');

  return {
    usage: 'recall',
    command: state => (args, player) => {
      const home = player.getMeta('waypoints.home');
      if (!home) {
        return B.sayAt(player, 'You do not have a home waypoint set.');
      }

      if (player.getAttribute('energy') < (player.getMaxAttribute('energy') / 3)) {
        return B.sayAt(player, 'You do not have enough energy to recall.');
      }

      const cost = Math.round(player.getMaxAttribute('energy') / 3);
      player.lowerAttribute('energy', cost);

      B.sayAt(player, '<b><cyan>You pray to the gods to be returned home and are consumed by a bright blue light.</cyan></b>');
      B.sayAtExcept(player.room, `<b><cyan>${player.name} disappears in a flash of blue light.</cyan></b>`, [player]);

      const nextRoom = state.RoomManager.getRoom(home);
      player.moveTo(nextRoom, _ => {
        state.CommandManager.get('look').execute('', player);

        B.sayAt(player, '<b><cyan>The blue light dims and you find yourself at the wayshrine.</cyan></b>');
        B.sayAtExcept(player.room, `<b><cyan>The waypiller glows brightly and ${player.name} appears in a flash of blue light.</cyan></b>`, [player]);
      });
    }
  };
};
