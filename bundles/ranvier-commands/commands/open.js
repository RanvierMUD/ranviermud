'use strict';

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return {
    aliases: ['close', 'lock', 'unlock', 'закрыть', 'запереть', 'открыть', 'отпереть'],
    usage: '[открыть/закрыть/запереть/отпереть] <предмет> / [открыть/закрыть/запереть/отпереть] <направление двери>',
    command: state => (args, player, arg0) => {
      const action = arg0.toString().toLowerCase();
      let validTarget = false;
      if (!args || !args.length) {
        return B.sayAt(player, `Что вы хотите ${action}?`);
      }

      if (!player.room) {
        return B.sayAt(player, 'Вы в НИГДЕ.');
      }

      const parts = args.split(' ');

      let exitDirection = parts[0];
      if ((parts[0] === 'door' || parts[0] === 'дверь')  && parts.length >= 2) {
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
            case 'open':
			case 'открыть':
			{
              if (door.locked) {
                if (door.lockedBy) {
                  const playerKey = player.hasItem(door.lockedBy);
                  if (playerKey) {
                    B.sayAt(player, `*Щелк* Вы отперли дверь ${ItemUtil.display(playerKey)} и открыли её.`);
                    doorRoom.unlockDoor(targetRoom);
                    return doorRoom.openDoor(targetRoom);
                  }
                }
                return B.sayAt(player, "Дверь заперта и вы не можете её открыть.");
              }
              if (door.closed) {
                B.sayAt(player, "Дверь открывается.");
                return doorRoom.openDoor(targetRoom);
              } else {
                return B.sayAt(player, "Дверь не закрыта.");
              }
            }
            case 'close':
			case 'закрыть':
			{
              if (door.locked || door.closed) {
                return B.sayAt(player, "Дверь уже закрыта.");
              }
              B.sayAt(player, "Дверь закрывается.");
              return doorRoom.closeDoor(targetRoom);
            }
            case 'lock':
			case 'запереть':
			{
              if (door.locked) {
                return B.sayAt(player, "Дверь уже заперта.");
              }
              if (!door.lockedBy) {
                return B.sayAt(player, "Вы не можете запереть эту дверь.");
              }
              const playerKey = player.hasItem(door.lockedBy);
              if (!playerKey) {
                const keyItem = state.ItemFactory.getDefinition(door.lockedBy);
                if (!keyItem) {
                  return B.sayAt(player, "У вас нет ключа.");
                }
                return B.sayAt(player, `Дверь может быть заперта только с помощью ${keyItem.name}.`);
              }
              doorRoom.lockDoor(targetRoom);
              return B.sayAt(player, '*Щелк* Дверь заперта.');
            }
            case 'unlock': 
			case 'отпереть':
			{
              if (door.locked) {
                if (door.lockedBy) {
                  if (player.hasItem(door.lockedBy)) {
                    B.sayAt(player, '*Щелк* Дверь открылась.');
                    return doorRoom.unlockDoor(targetRoom);
                  } else {
                    return B.sayAt(player, `Дверь может быть открыта только с помощью ${keyItem.name}.`);
                  }
                } else {
                  return B.sayAt(player, "Вы не можете открыть эту дверь.");
                }
              }
              if (door.closed) {
                return B.sayAt(player, "Дверь не заперта.");
              } else {
                return B.sayAt(player, "Дверь уже открыта.");
              }
            }
          }
        }
      }

      // otherwise trying to open an item
      let item = Parser.parseDot(args, player.inventory);
      item = item || Parser.parseDot(args, player.room.items);

      if (item) {
        validTarget = true;
        if (typeof item.closed == 'undefined' && typeof item.locked == 'undefined') {
          return B.sayAt(player, `${ItemUtil.display(item)} не является контейнером.`)
        }
        switch (action) {
          case 'open': 
		  case 'открыть':
		  {
            if (item.locked) {
              if (item.lockedBy) {
                const playerKey = player.hasItem(item.lockedBy);
                if (playerKey) {
                  B.sayAt(player, `*Щелк* Вы отперли ${ItemUtil.display(item)} с помощью ${ItemUtil.display(playerKey)} и открыли.`);
                  item.unlock();
                  item.open();
                  return;
                }
              }
              return B.sayAt(player, "Предмет закрыт и у вас нет ключа.");
            }
            if (item.closed) {
              B.sayAt(player, `Вы открыли ${ItemUtil.display(item)}.`);
              return item.open();
            }
            return B.sayAt(player, `${ItemUtil.display(item)} не закрыт...`);
          }
          case 'close': 
		  case 'закрыть':{
            if (item.locked || item.closed) {
              return B.sayAt(player, "Это уже закрыто.");
            }
            if (typeof item.closed == 'undefined') {
              return B.sayAt(player, "Вы не можете закрыть это.");
            }
            B.sayAt(player, `Вы закрыли ${ItemUtil.display(item)}.`);
            return item.close();
          }
          case 'lock': 
		  case 'запереть':{
            if (item.locked) {
              return B.sayAt(player, "Это уже закрыто.");
            }
            if (!item.lockedBy) {
              return B.sayAt(player, `Вы не можете запереть ${ItemUtil.display(item)}.`);
            }
            const keyItem = state.ItemFactory.getDefinition(item.lockedBy);
            if (!keyItem) {
              return B.sayAt(player, `Вы не можете запереть ${ItemUtil.display(item)}.`);
            }
            const playerKey = player.hasItem(item.lockedBy);
            if (playerKey) {
              B.sayAt(player, `*Щелк* Вы заперли ${ItemUtil.display(item)} с помощью ${ItemUtil.display(playerKey)}.`);
              return item.lock();
            }
            return B.sayAt(player, "Предмет заперт и у вас нет ключа.");
          }
          case 'unlock': 
		  case 'отпереть':
		  {
            if (item.locked) {
              if (item.lockedBy) {
                const playerKey = player.hasItem(item.lockedBy);
                if (playerKey) {
                  B.sayAt(player, `*Щелк* Вы отперли ${ItemUtil.display(item)} с помощью ${ItemUtil.display(playerKey)}.`);
                  return item.unlock();
                } else {
                  return B.sayAt(player, "Предмет заперт и у вас нет ключа.");
                }
              } else {
                B.sayAt(player, `*Щелк* Вы отперли ${ItemUtil.display(item)}.`);
                return item.unlock();
              }
            }
            if (!item.closed) {
              return B.sayAt(player, `${ItemUtil.display(item)} не заперт...`);
            }
            return B.sayAt(player, `${ItemUtil.display(item)} не заперт...`);
          }
        }
      }

      if (validTarget) {
        return B.sayAt(player, `Вы не можете ${action} это!`);
      } else {
        return B.sayAt(player, `Вы не можете увидеть ${args} здесь.`);
      }
    }
  };
};
