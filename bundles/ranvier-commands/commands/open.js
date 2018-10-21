'use strict';

const Ranvier = require('ranvier');
const { Broadcast: B } = Ranvier;
const { CommandParser } = Ranvier.CommandParser;
const ItemUtil = require('../../ranvier-lib/lib/ItemUtil');

module.exports = {
  aliases: ['close', 'lock', 'unlock'],
  usage: '[open/close/lock/unlock] <item> / [open/close/lock/unlock] <door direction>/ [open/close/lock/unlock] <door direction>',
  command: state => (args, player, arg0) => {
    const action = arg0.toString().toLowerCase();
    let validTarget = false;
    if (!args || !args.length) {
      return B.sayAt(player, `What do you want to ${action}?`);
    }

    if (!player.room) {
      return B.sayAt(player, 'You are floating in the nether.');
    }

    const parts = args.split(' ');

    let exitDirection = parts[0];
    if (parts[0] === 'door' && parts.length >= 2) {
      // Exit is in second parameter
      exitDirection = parts[1];
    }

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

      exitDirection = dir;
      validTarget = true;
      const exit = state.RoomManager.findExit(player.room, exitDirection);
      let doorRoom = player.room;
      let nextRoom = null;
      let door = null;
      let targetRoom = null;

      if (exit) {
        nextRoom = state.RoomManager.getRoom(exit.roomId);
      } else {
        if (doorRoom.coordinates) {
          const coords = doorRoom.coordinates;
          const area = doorRoom.area;
          nextRoom = area.getRoomAtCoordinates(coords.x + diff[0], coords.y + diff[1], coords.z + diff[2]);
        }
      }

      if (nextRoom) {
        targetRoom = nextRoom;
        door = doorRoom.getDoor(targetRoom);
        if (!door) {
          doorRoom = nextRoom;
          targetRoom = player.room;
          door = doorRoom.getDoor(targetRoom);
        }
      }

      if (door) {
        switch (action) {
          case 'open': {
            if (door.locked) {
              if (door.lockedBy) {
                const playerKey = player.hasItem(door.lockedBy);
                if (playerKey) {
                  B.sayAt(player, `*Click* You unlock the door with ${ItemUtil.display(playerKey)} and open it.`);
                  doorRoom.unlockDoor(targetRoom);
                  return doorRoom.openDoor(targetRoom);
                }
              }
              return B.sayAt(player, "The door is locked and you don't have the key.");
            }
            if (door.closed) {
              B.sayAt(player, "The door swings open.");
              return doorRoom.openDoor(targetRoom);
            } else {
              return B.sayAt(player, "The door is not closed.");
            }
          }
          case 'close': {
            if (door.locked || door.closed) {
              return B.sayAt(player, "The door is already closed.");
            }
            B.sayAt(player, "The door swings closed.");
            return doorRoom.closeDoor(targetRoom);
          }
          case 'lock': {
            if (door.locked) {
              return B.sayAt(player, "The door is already locked.");
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
            return B.sayAt(player, '*Click* The door locks.');
          }
          case 'unlock': {
            if (door.locked) {
              if (door.lockedBy) {
                if (player.hasItem(door.lockedBy)) {
                  B.sayAt(player, '*Click* The door unlocks.');
                  return doorRoom.unlockDoor(targetRoom);
                } else {
                  return B.sayAt(player, `The door can only be unlocked with ${keyItem.name}.`);
                }
              } else {
                return B.sayAt(player, "You can't unlock that door.");
              }
            }
            if (door.closed) {
              return B.sayAt(player, "It is already unlocked.");
            } else {
              return B.sayAt(player, "That's already open.");
            }
          }
        }
      }
    }

    // otherwise trying to open an item
    let item = CommandParser.parseDot(args, player.inventory);
    item = item || CommandParser.parseDot(args, player.room.items);

    if (item) {
      validTarget = true;
      if (typeof item.closed == 'undefined' && typeof item.locked == 'undefined') {
        return B.sayAt(player, `${ItemUtil.display(item)} is not a container.`)
      }
      switch (action) {
        case 'open': {
          if (item.locked) {
            if (item.lockedBy) {
              const playerKey = player.hasItem(item.lockedBy);
              if (playerKey) {
                B.sayAt(player, `*Click* You unlock ${ItemUtil.display(item)} with ${ItemUtil.display(playerKey)} and open it.`);
                item.unlock();
                item.open();
                return;
              }
            }
            return B.sayAt(player, "The item is locked and you don't have the key.");
          }
          if (item.closed) {
            B.sayAt(player, `You open ${ItemUtil.display(item)}.`);
            return item.open();
          }
          return B.sayAt(player, `${ItemUtil.display(item)} isn't closed...`);
        }
        case 'close': {
          if (item.locked || item.closed) {
            return B.sayAt(player, "It's already closed.");
          }
          if (typeof item.closed == 'undefined') {
            return B.sayAt(player, "You can't close that.");
          }
          B.sayAt(player, `You close ${ItemUtil.display(item)}.`);
          return item.close();
        }
        case 'lock': {
          if (item.locked) {
            return B.sayAt(player, "It's already locked.");
          }
          if (!item.lockedBy) {
            return B.sayAt(player, `You can't lock ${ItemUtil.display(item)}.`);
          }
          const keyItem = state.ItemFactory.getDefinition(item.lockedBy);
          if (!keyItem) {
            return B.sayAt(player, `You can't lock ${ItemUtil.display(item)}.`);
          }
          const playerKey = player.hasItem(item.lockedBy);
          if (playerKey) {
            B.sayAt(player, `*click* You lock ${ItemUtil.display(item)} with ${ItemUtil.display(playerKey)}.`);
            return item.lock();
          }
          return B.sayAt(player, "The item is locked and you don't have the key.");
        }
        case 'unlock': {
          if (item.locked) {
            if (item.lockedBy) {
              const playerKey = player.hasItem(item.lockedBy);
              if (playerKey) {
                B.sayAt(player, `*click* You unlock ${ItemUtil.display(item)} with ${ItemUtil.display(playerKey)}.`);
                return item.unlock();
              } else {
                return B.sayAt(player, "The item is locked and you don't have the key.");
              }
            } else {
              B.sayAt(player, `*Click* You unlock ${ItemUtil.display(item)}.`);
              return item.unlock();
            }
          }
          if (!item.closed) {
            return B.sayAt(player, `${ItemUtil.display(item)} isn't closed...`);
          }
          return B.sayAt(player, `${ItemUtil.display(item)} isn't locked...`);
        }
      }
    }

    if (validTarget) {
      return B.sayAt(player, `You can't ${action} this!`);
    } else {
      return B.sayAt(player, `You don't see ${args} here.`);
    }
  }
};
