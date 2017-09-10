'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    usage: 'unlock <door direction>',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, 'Unlock which door?');
      }

      const parts = args.split(' ');
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

        if (!door.locked) {
          return B.sayAt(player, 'The door is already unlocked.');
        }

        if (!door.lockedBy) {
          return B.sayAt(player, "You can't unlock that door.");
        }

        const playerKey = player.hasItem(door.lockedBy);
        if (!playerKey) {
          const keyItem = state.ItemFactory.getDefinition(door.lockedBy);
          if (!keyItem) {
            return B.sayAt(player, "You don't have the key.");
          }

          return B.sayAt(player, `The door can only be unlocked with ${keyItem.name}.`);
        }

        doorRoom.unlockDoor(targetRoom);
        return B.sayAt(player, '*click* The door unlocks.');
      }

      // otherwise trying to open an item
      let item = Parser.parseDot(args, player.inventory);
      item = item || Parser.parseDot(args, player.room.items);

      if (!item) {
        return B.sayAt(player, "You don't see that here.");
      }

      if (!item.closed) {
        return B.sayAt(player, `${item.display} isn't closed...`);
      }

      if (!item.locked) {
        return B.sayAt(player, `${item.display} isn't locked...`);
      }

      if (item.locked) {
        if (item.lockedBy) {
          const playerKey = player.hasItem(item.lockedBy);
          if (playerKey) {
            B.sayAt(player, `*click* You unlock ${item.display} with ${playerKey.display}.`);
            item.unlock();
            return;
          }
        }

        return B.sayAt(player, "The item is locked and you don't have the key.");
      }

      B.sayAt(player, `*click* You unlock ${item.display}.`);
      return item.unlock();
    }
  };
};
