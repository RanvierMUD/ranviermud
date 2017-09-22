'use strict';

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    usage: 'open <item> / open door <door direction>',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, "Open what?");
      }

      if (!player.room) {
        return B.sayAt(player, 'You are floating in the nether.');
      }

      const parts = args.split(' ');

      // player is opening a door
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

        if (door.locked) {
          if (door.lockedBy) {
            const playerKey = player.hasItem(door.lockedBy);
            if (playerKey) {
              B.sayAt(player, `*click* You unlock the door with ${playerKey.display} and open it.`);
              doorRoom.unlockDoor(targetRoom);
              doorRoom.openDoor(targetRoom);
              return;
            }
          }

          return B.sayAt(player, "The door is locked and you don't have the key.");
        }

        if (!door.closed) {
          return B.sayAt(player, "The door isn't closed...");
        }

        B.sayAt(player, "The door swings open.");
        return doorRoom.openDoor(targetRoom);
      }

      // otherwise trying to open an item
      let item = Parser.parseDot(args, player.inventory);
      item = item || Parser.parseDot(args, player.room.items);

      if (!item) {
        return B.sayAt(player, "You don't see that here.");
      }

      if (item.locked) {
        if (item.lockedBy) {
          const playerKey = player.hasItem(item.lockedBy);
          if (playerKey) {
            B.sayAt(player, `*click* You unlock ${ItemUtil.display(item)} with ${playerKey.display} and open it.`);
            item.unlock();
            item.open();
            return;
          }
        }

        return B.sayAt(player, "The item is locked and you don't have the key.");
      }

      if (!item.closed) {
        return B.sayAt(player, `${ItemUtil.display(item)} isn't closed...`);
      }

      B.sayAt(player, `You open ${ItemUtil.display(item)}.`);
      return item.open();
    }
  };
};
