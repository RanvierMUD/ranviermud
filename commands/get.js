'use strict';
const l10nFile = __dirname + '/../l10n/commands/get.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const ItemUtil    = require('../src/item_util').ItemUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => 
  (args, player) => {

    // No picking stuff up in combat
    if (player.isInCombat()) {
      return player.warn("You cannot do that while you're fighting.");
    }

    const room       = rooms.getAt(player.getLocation());
    const playerName = player.getName();

    if (args.toLowerCase() === "all") {
      return getAllItems(room);
    }

    const itemFound = CommandUtil.findItemInRoom(items, args, room, player);
    if (!itemFound) {
      return player.warn(`You find no ${args} here.`);
    }
    
    const item = items.get(itemFound);
    return tryToPickUp(item);

    // -- Handy McHelpertons...

    function tryToPickUp(item) {
      const [ tooLarge, tooHeavy ] = ItemUtil.checkInventory(player, item, items);
      const canPickUp = [ tooLarge, tooHeavy ].every( predicate => !predicate );
      const canHold   = player.canHold();

      if (canHold && !tooHeavy) { 
        return hold(item);
      } else if (canPickUp) {
        return pickUp(item);
      } else {
        const message = ItemUtil.getFailureMessage(tooLarge, tooHeavy, item);
        return player.warn(message);
      }
    }

    function pickUp(item) {
      return ItemUtil.pickUp({ player, room, item, items }, 
        container => {
          const itemName      = item.getShortDesc();
          const containerName = container.getShortDesc();

          util.log(`${playerName} picked up ${itemName} in ${player.getLocation()}`);
          player.say(`You pick up the ${itemName} and place it in your ${containerName}.`);
          player.emit('action', 1, items);

          players.eachIf(
            p => CommandUtil.inSameRoom(p, player),
            p => p.say(`${playerName} picks up the ${itemName} and places it in their ${containerName}.`)
          );
        });
    }

    function hold(item) {

      return ItemUtil.hold({ player, room, item }, 
        location => {
          const itemName = item.getShortDesc();
          if (item.getAttribute('damage')) {
            return Commands.player_commands.wield.execute(item.getKeywords()[0], player);
          }
          item.emit('hold', location, room, player, players);

          player.say(`You pick up the ${itemName} and hold it.`);
          player.emit('action', 1, items);
          
          players.eachIf(
            p => CommandUtil.inSameRoom(p, player),
            p => p.say(`${playerName} picks up the ${itemName} and holds it.`)
          );
        });
    }

    function getAllItems(room) {
      const itemsInRoom = room.getItems().map( id => items.get(id) );
      if (!itemsInRoom.length) { return player.say(`Nothing in here to get.`); }
      itemsInRoom.forEach( item => tryToPickUp(item) );
    }

  };
