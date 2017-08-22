'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    usage: 'lock <item> / lock door <door direction>',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, 'Lock which door?');
      }

      const parts = args.split(' ');
      if (parts[0] === 'door' && parts.length >= 2) {
        const exitDirection = parts[1];
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
          return B.sayAt(player, 'The door is already locked.');
        }

        if (!door.lockedBy) {
          return B.sayAt(player, "You can't lock that door.");
        }

        const playerKey = player.hasItem(door.lockedBy);
        if (!playerKey) {
          const keyItem = state.ItemFactory.getDefinition(door.lockedBy);
          if (!keyItem) {
            return B.sayAt(player, "You don't have the key.");
          }
          return B.sayAt(player, `The door can only be locked with ${keyItem.name}.`);
        }

        doorRoom.lockDoor(targetRoom);
        return B.sayAt(player, '*click* The door locks.');
      }

      // otherwise trying to close an item
      let item = Parser.parseDot(args, player.inventory);
      item = item || Parser.parseDot(args, player.room.items);

      if (!item) {
        return B.sayAt(player, "You don't see that here.");
      }

      if (item.locked) {
        return B.sayAt(player, "It's already locked.");
      }

      if (!item.lockedBy) {
        return B.sayAt(player, `You can't lock ${item.display}.`);
      }

      const playerKey = player.hasItem(item.lockedBy);
      if (playerKey) {
        B.sayAt(player, `*click* You lock ${item.display} with ${playerKey.display}.`);
        item.lock();
        return;
      }

      return B.sayAt(player, "The item is locked and you don't have the key.");
    }
  };
};
