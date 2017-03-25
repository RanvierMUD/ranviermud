'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const PlayerRoles = require(srcPath + 'PlayerRoles');

  return {
    aliases: ['tp'],
    usage: 'teleport <player/room>',
    requiredRole: PlayerRoles.ADMIN,
    command: (state) => (args, player) => {
      if (!args || !args.length) {
        return Broadcast.sayAt(player, 'Must specify a destination using an online player or room entity reference.');
      }

      const target = args;
      const isRoom = target.includes(':');
      let targetRoom = null;

      if (isRoom) {
        targetRoom = state.RoomManager.getRoom(target);
        if (!targetRoom) {
          return Broadcast.sayAt(player, 'No such room entity reference exists.');
        } else if (targetRoom === player.room) {
          return Broadcast.sayAt(player, 'You try really hard to teleport before realizing you\'re already at your destination.');
        }
      } else {
        const targetPlayer = state.PlayerManager.getPlayer(target);
        if (!targetPlayer) {
          return Broadcast.sayAt(player, 'No such player online.');
        } else if (targetPlayer === player || targetPlayer.room === player.room) {
          return Broadcast.sayAt(player, 'You try really hard to teleport before realizing you\'re already at your destination.');
        }

        targetRoom = targetPlayer.room;
      }

      const oldRoom = player.room;

      player.moveTo(targetRoom, () => {
        Broadcast.sayAt(player, '<b><green>You snap your finger and instantly appear in a new room.</green></b>');
        Broadcast.sayAt(player, '');
        state.CommandManager.get('look').execute('', player);
      });

      Broadcast.sayAt(oldRoom, `${player.name} teleports away.`);
      Broadcast.sayAtExcept(targetRoom, `${player.name} teleports here.`, player);
    }
  }
};