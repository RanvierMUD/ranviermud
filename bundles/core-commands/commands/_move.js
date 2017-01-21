'use strict';
const util  = require('util');

/**
 * Move player in a given direction from their current room
 * TODO: Move into core-commands
 * @param {string} exit   direction they tried to go
 * @param {Player} player
 * @return boolean False if the exit is inaccessible.
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command: (state) => (exit, player) => {
      const room = player.room;
      if (!room) {
        return false;
      }

      const exits = Array.from(room.exits).filter(e => e.direction.indexOf(exit) === 0);

      if (!exits.length) {
        return false;
      }

      if (exits.length > 1) {
        throw 'Be more specific. Which way would you like to go?';
      }

      if (player.inCombat) {
        throw 'You are in the middle of a fight!';
      }

      exit = exits.pop();
      const nextRoom =  state.RoomManager.getRoom(exit.roomId, player.room.area);

      player.room.emit('playerLeave', player, nextRoom);
      for (const npc of player.room.npcs) {
        npc.emit('playerLeave', player, nextRoom);
      }
      player.room.removePlayer(player);

      player.room = nextRoom;
      nextRoom.addPlayer(player);
      nextRoom.emit('playerEnter', player);
      for (const npc of nextRoom.npcs) {
        npc.emit('playerEnter', player);
      }

      state.CommandManager.get('look').execute('', player);
      return true;
    }
  }
};
