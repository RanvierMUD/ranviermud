'use strict';

/**
 * Move player in a given direction from their current room
 * @param {string} exit   direction they tried to go
 * @param {Player} player
 * @return {boolean} False if the exit is inaccessible.
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Player = require(srcPath + 'Player');

  return {
    aliases: [ "go", "walk" ],
    usage: 'move [direction]',
    command: (state) => (exitName, player) => {
      const room = player.room;
      if (!room) {
        return false;
      }

      if (player.isInCombat()) {
        return Broadcast.sayAt(player, 'You are in the middle of a fight!');
      }

      const exit = state.RoomManager.findExit(room, exitName);

      if (!exit) {
        return Broadcast.sayAt(player, "You can't go that way.");
      }

      const nextRoom = state.RoomManager.getRoom(exit.roomId);

      player.room.emit('playerLeave', player, nextRoom);
      for (const npc of player.room.npcs) {
        npc.emit('playerLeave', player, nextRoom);
      }
      player.room.removePlayer(player);

      player.room = nextRoom;
      nextRoom.addPlayer(player);

      state.CommandManager.get('look').execute('', player);

      // Emit events after the look command so that any messages
      // sent by events appear after the room desc/prompt
      for (const npc of nextRoom.npcs) {
        npc.emit('playerEnter', player);
      }
      nextRoom.emit('playerEnter', player);

      for (const follower of player.followers) {
        if (follower instanceof Player) {
          Broadcast.sayAt(follower, `\r\nYou follow ${player.name}.`);
          state.CommandManager.get('move').execute(exitName, follower);
        } else {
          follower.room.removeNpc(follower);
          nextRoom.addNpc(follower);
        }
      }

      return true;
    }
  };
};
