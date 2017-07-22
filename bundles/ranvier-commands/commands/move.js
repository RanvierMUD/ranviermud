'use strict';

/**
 * Move player in a given direction from their current room
 * @param {string} exit   direction they tried to go
 * @param {Player} player
 * @return {boolean} False if the exit is inaccessible.
 */
module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');
  const Player = require(srcPath + 'Player');

  return {
    aliases: [ "go", "walk" ],
    usage: 'move [direction]',
    command: (state) => (exitName, player) => {
      const oldRoom = player.room;
      if (!oldRoom) {
        return false;
      }

      if (player.isInCombat()) {
        return B.sayAt(player, 'You are in the middle of a fight!');
      }

      const exit = state.RoomManager.findExit(oldRoom, exitName);

      if (!exit) {
        return B.sayAt(player, "You can't go that way.");
      }

      const nextRoom = state.RoomManager.getRoom(exit.roomId);

      const door = nextRoom.getDoor(oldRoom);
      if (door) {
        if (door.locked) {
          return B.sayAt(player, "The door is locked.");
        }

        if (door.closed) {
          return B.sayAt(player, "The door is closed.");
        }
      }

      player.moveTo(nextRoom, _ => {
        state.CommandManager.get('look').execute('', player);
      });

      B.sayAt(oldRoom, `${player.name} leaves.`);
      B.sayAtExcept(nextRoom, `${player.name} enters.`, player);

      for (const follower of player.followers) {
        if (follower.room !== oldRoom) {
          continue;
        }

        if (follower instanceof Player) {
          B.sayAt(follower, `\r\nYou follow ${player.name} to ${nextRoom.title}.`);
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
