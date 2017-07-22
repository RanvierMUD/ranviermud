'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');

  return {
    usage: 'unlock <door direction>',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, 'Unlock which door?');
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
  };
};
