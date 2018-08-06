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
        return B.sayAt(player, 'Вы посреди битвы!');
      }

      const exit = state.RoomManager.findExit(oldRoom, exitName);
      let nextRoom = null;

      if (!exit) {
        if (oldRoom.coordinates) {
          const coords = oldRoom.coordinates;
          const area = oldRoom.area;
          const directions = {
            north: [0, 1, 0],
            south: [0, -1, 0],
            east: [1, 0, 0],
            west: [-1, 0, 0],
            up: [0, 0, 1],
            down: [0, 0, -1],
          };

          for (const [dir, diff] of Object.entries(directions)) {
            if (dir.indexOf(exitName) !== 0) {
              continue;
            }

            nextRoom = area.getRoomAtCoordinates(coords.x + diff[0], coords.y + diff[1], coords.z + diff[2]);
          }
        } else {
          return B.sayAt(player, "Вы не можете пойти этим путем.");
        }
      } else {
        nextRoom = state.RoomManager.getRoom(exit.roomId);
      }

      if (!nextRoom) {
        return B.sayAt(player, "Вы не можете пойти этим путем.");
      }

      // check to see if this room has a door leading to the target room or vice versa
      const door = oldRoom.getDoor(nextRoom) || nextRoom.getDoor(oldRoom);
      if (door) {
        if (door.locked) {
          return B.sayAt(player, "Дверь заперта.");
        }

        if (door.closed) {
          return B.sayAt(player, "Дверь заперта.");
        }
      }


      player.moveTo(nextRoom, _ => {
        state.CommandManager.get('look').execute('', player);
      });

      B.sayAt(oldRoom, `${player.name} уходит.`);
      B.sayAtExcept(nextRoom, `${player.name} приходит.`, player);

      for (const follower of player.followers) {
        if (follower.room !== oldRoom) {
          continue;
        }

        if (follower instanceof Player) {
          B.sayAt(follower, `\r\nВы следуете за ${player.name} в ${nextRoom.title}.`);
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
