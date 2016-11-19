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
      return player.warn(`You find no ${args} here`);
    }
    
    const item = items.get(itemFound);
    return tryToPickUp(item);

    // -- Handy McHelpertons...

    function tryToPickUp(item) {
      const canPickUp = inventoryFull(item)
        .every( predicate => predicate === true );
      
      if (canPickUp) {
        return pickUp(item);
      } else {
        const message = getFailureMessage(canPickUp);
        return player.warn(message);
      }
    }

    function pickUp(item) {
      player.sayL10n(l10n, 'ITEM_PICKUP', item.getShortDesc('en'));
      item.setRoom(null);
      item.setHolder(playerName);
      player.addItem(item);
      room.removeItem(item.getUuid());

      util.log(playerName + ' picked up ' + item.getShortDesc('en'));

      players.eachIf(
        p => CommandUtil.inSameRoom(p, player),
        p => p.sayL10n(l10n, 'OTHER_PICKUP', playerName, item.getShortDesc(p.getLocale()))
      );
    }

    function getFailureMessage(predicates, item) {
      const itemName               = item.getShortDesc();
      const [ tooLarge, tooHeavy ] = predicates;

      if (tooLarge) { return `${itemName} will not fit in your inventory, it is too large.`; }
      if (tooHeavy) { return `${itemName} is too heavy for you to carry at the moment.`; }
      return `You cannot pick up ${itemName} right now.`;
    }

    function getAllItems(room) {
      const itemsInRoom = room.getItems().map( id => items.get(id) );
      itemsInRoom.forEach( item => tryToPickUp(item) );
    }

    function inventoryFull(item) {
      const inventory = player.getInventory();
      return [ tooLarge(inventory, item) , tooHeavy(inventory, item) ];
    }

    //TODO: Extract all of these vvv to ItemUtils.js to use in take/put commands as well.

    function tooLarge(inventory) {
      const itemWeight = item.getWeight();
      if (itemWeight === Infinity) { return true; }

      const carriedWeight  = player.getCarriedWeight();
      const maxCarryWeight = player.getMaxCarryWeight();

      return (carriedWeight + itemWeight) > maxCarryWeight;
    }

    function tooHeavy(inventory, item) {
      const itemWeight = item.getWeight();
      if (itemWeight === Infinity) { return true; }

      const carriedWeight  = player.getCarriedWeight();
      const maxCarryWeight = player.getMaxCarryWeight();

      return (carriedWeight + itemWeight) > maxCarryWeight;
    }

  };