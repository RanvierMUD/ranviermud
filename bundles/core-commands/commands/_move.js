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
        return true;
      }

      if (player.inCombat) {
        throw 'You are in the middle of a fight!';
        return true;
      }

      exit = exits.pop();
      player.room.emit('playerLeave', player);
      player.room.removePlayer(player);
      const nextRoom =  state.RoomManager.getRoom(exit.roomId, player.room.area);
      player.room = nextRoom;
      nextRoom.addPlayer(player);
      nextRoom.emit('playerEnter', player);

      state.CommandManager.get('look').execute('', player);
      return true;
    }
  }
};
