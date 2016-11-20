'use strict';
const l10nFile = __dirname + '/../l10n/commands/get.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => 
  (args, player) => {

    player.emit('action', 0);

    // No picking stuff up in combat
    if (player.isInCombat()) {
      player.warn("You cannot do that while you're fighting.");
      return;
    }

    const room = rooms.getAt(player.getLocation());
    const playerName = player.getName();

    if (args.toLowerCase() === "all") {
      getAllItems(room);
      return;
    }

    const itemFound = CommandUtil.findItemInRoom(items, args, room, player);
    if (!itemFound) {
      return player.warn(`You find no ${args} here.`);
    }
    
    const item = items.get(itemFound);
    return tryToPickUp(item);

    // -- Handy McHelpertons...

    function tryToPickUp(item) {
      const [ tooLarge, tooHeavy ] = checkInventory(item);
      const canPickUp = [ tooLarge, tooHeavy ].every( predicate => !predicate );
      const canHold   = player.canHold();

      if (canPickUp) {
        return pickUp(item);
      } else if (canHold && !tooHeavy) {
        return hold(item);
      } else {
        const message = getFailureMessage(tooLarge, tooHeavy, item);
        return player.warn(message);
      }
    }

    function pickUp(item) {
      item.setRoom(null);
      item.setHolder(playerName);
      
      const container = player.getContainerWithCapacity(item.getAttribute('size'));
      container.addItem(item);
      item.setContainer(container);
      room.removeItem(item.getUuid());

      const itemName      = item.getShortDesc();
      const containerName = container.getShortDesc();

      util.log(`${playerName} picked up ${itemName}`);
      player.say(`You pick up the ${itemName} and place it in your ${containerName}.`);

      players.eachIf(
        p => CommandUtil.inSameRoom(p, player),
        p => p.say(`${playerName} picks up the ${itemName} and places it in their ${containerName}.`)
      );
    }

    function hold(item) {
      const equipment = player.getEquipped();
      if (!equipment['held']) { player.equip('held', item); }
      else { player.equip('offhand held', item); }

      const itemName = item.getShortDesc();
      player.say(`You pick up the ${itemName} and hold it.`);
      players.eachIf(
        p => CommandUtil.inSameRoom(p, player),
        p => p.say(`${playerName} picks up the ${itemName} and holds it.`)
      );

      player.addItem(item);
      room.removeItem(item.getUuid());
      item.setRoom(null);
      item.setHolder(player.getName());

      item.emit('hold', location, room, player, players);
    }

 

    function getFailureMessage(tooLarge, tooHeavy, item) {
      const itemName = item.getShortDesc();
      
      if (tooLarge) { return `The ${itemName} will not fit in your inventory, it is too large.`; }
      if (tooHeavy) { return `The ${itemName} is too heavy for you to carry at the moment.`; }
      return `You cannot pick up ${itemName} right now.`;
    }

    function getAllItems(room) {
      const itemsInRoom = room.getItems().map( id => items.get(id) );
      itemsInRoom.forEach( item => tryToPickUp(item) );
    }

    function checkInventory(item) {
      const inventory = player.getInventory();
      return [ tooLarge(inventory, item) , tooHeavy(inventory, item) ];
    }

    //TODO: Extract all of these vvv to ItemUtils.js to use in take/put commands as well.
    function tooLarge(inventory, item) {
      const itemSize = item.getAttribute('size');
      if (itemSize === Infinity) { return true; }

      const containerWithCapacity = player.getContainerWithCapacity(itemSize);
      return !containerWithCapacity;
    }

    function tooHeavy(inventory, item) {
      const itemWeight = item.getWeight();
      if (itemWeight === Infinity) { return true; }

      const carriedWeight  = player.getCarriedWeight();
      const maxCarryWeight = player.getMaxCarryWeight();

      return (carriedWeight + itemWeight) > maxCarryWeight;
    }

  };