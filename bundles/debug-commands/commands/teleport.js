'use strict';

const { Broadcast, PlayerRoles } = require('ranvier');

module.exports = {
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

    player.followers.forEach(follower => {
      follower.unfollow();
      if (!follower.isNpc) {
        Broadcast.sayAt(follower, `You stop following ${player.name}.`);
      }
    });

    if (player.isInCombat()) {
      player.removeFromCombat();
    }

    const oldRoom = player.room;

    player.moveTo(targetRoom, () => {
      Broadcast.sayAt(player, '<b><green>You snap your finger and instantly appear in a new room.</green></b>\r\n');
      state.CommandManager.get('look').execute('', player);
    });

    Broadcast.sayAt(oldRoom, `${player.name} teleported away.`);
    Broadcast.sayAtExcept(targetRoom, `${player.name} teleported here.`, player);
  }
};
