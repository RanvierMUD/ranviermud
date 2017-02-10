'use strict';
const util  = require('util');

/**
 * Move player in a given direction from their current room
 * @param {string} exit   direction they tried to go
 * @param {Player} player
 * @return {boolean} False if the exit is inaccessible.
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    aliases: [ "go", "walk" ],
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

      if (player.isInCombat()) {
        throw 'You are in the middle of a fight!';
      }

      exit = exits.pop();
      const nextRoom =  state.RoomManager.getRoom(exit.roomId);

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
      return true;
    }
  };
};
