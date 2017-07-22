'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');

  return {
    usage: 'open <door direction>',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, "Open which door?");
      }

      let exitDirection = args;
      const parts = args.split(' ');
      if (parts[0] === 'door' && parts.length >= 2) {
        exitDirection = parts[1];
      }

      const exit = state.RoomManager.findExit(player.room, exitDirection);

      if (!exit) {
        return B.sayAt(player, "There is no door there.");
      }

      const nextRoom = state.RoomManager.getRoom(exit.roomId);
      let doorRoom = player.room;
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
            doorRoom.unlockDoor(targetRoom);
            doorRoom.openDoor(targetRoom);
            return B.sayAt(player, `*click* You unlock the door with ${playerKey.name} and open it.`);
          }
        }

        return B.sayAt(player, "The door is locked and you don't have the key.");
      }

      if (!door.closed) {
        return B.sayAt(player, "The door isn't closed...");
      }

      doorRoom.openDoor(targetRoom);
      return B.sayAt(player, "The door swings open.");
    }
  };
};
