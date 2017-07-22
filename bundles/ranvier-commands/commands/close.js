'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');

  return {
    usage: 'close <door direction>',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, "Close which door?");
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

      if (door.locked || door.closed) {
        return B.sayAt(player, "The door is already closed.");
      }

      doorRoom.closeDoor(targetRoom);
      return B.sayAt(player, "The door swings closed.");
    }
  };
};
