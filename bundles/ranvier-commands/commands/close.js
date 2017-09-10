'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    usage: 'close <item> / close door <door direction>',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, "Close what?");
      }

      const parts = args.split(' ');
      // closing a door
      if (parts[0] === 'door' && parts.length >= 2) {
        const exitDirection = parts[1];
        const exit = state.RoomManager.findExit(player.room, exitDirection);
        let doorRoom = player.room;
        let nextRoom = null;
        if (!exit && doorRoom.coordinates) {
          const coords = doorRoom.coordinates;
          const area = doorRoom.area;
          const directions = {
            north: [0, 1, 0],
            south: [0, -1, 0],
            east: [1, 0, 0],
            west: [-1, 0, 0],
            up: [0, 0, 1],
            down: [0, 0, -1],
          };

          for (const [dir, diff] of Object.entries(directions)) {
            if (dir.indexOf(exitDirection) !== 0) {
              continue;
            }

            nextRoom = area.getRoomAtCoordinates(coords.x + diff[0], coords.y + diff[1], coords.z + diff[2]);
          }
        } else {
          if (!exit) {
            return B.sayAt(player, "There is no door there.");
          }

          nextRoom = state.RoomManager.getRoom(exit.roomId);
        }

        let targetRoom = nextRoom;
        let door = doorRoom.getDoor(targetRoom);
        if (!door) {
          doorRoom = nextRoom;
          targetRoom = player.room;
          door = doorRoom.getDoor(targetRoom);
        }

        if (!door) {
          return B.sayAt(player, "That exit doesn't have a door.");
        }

        if (door.locked || door.closed) {
          return B.sayAt(player, "The door is already closed.");
        }

        B.sayAt(player, "The door swings closed.");
        return doorRoom.closeDoor(targetRoom);
      }

      // otherwise trying to close an item
      let item = Parser.parseDot(args, player.inventory);
      item = item || Parser.parseDot(args, player.room.items);

      if (!item) {
        return B.sayAt(player, "You don't see that here.");
      }

      if (!item.closeable) {
        return B.sayAt(player, "You can't close that.");
      }

      if (item.closed) {
        return B.sayAt(player, "It's already closed.");
      }

      B.sayAt(player, `You close ${item.display}.`);
      return item.close();
    }
  };
};
