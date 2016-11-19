'use strict';
const l10nFile = __dirname + '/../l10n/commands/get.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

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
      player.warn('The ' + args + ' could not be found here.');
      return;
    }
    
    const item = items.get(itemFound);
    tryToPickUp(item);

    function tryToPickUp(item) {
      if (inventoryFull(item)) {
        return player.warn('You are not able to carry that.');
      }
      else {
        return pickUp(item);
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

    function getAllItems(room) {
      const itemsInRoom = room.getItems().map( id => items.get(id) );
      itemsInRoom.forEach( item => tryToPickUp(item) );
    }

    //TODO: Change to calculate based on character's strength and pack size vs. item weight/size.
    function inventoryFull(item) {
      const inventory = player.getInventory();
      return tooManyItems(inventory) || tooHeavy(inventory, item);
    }

    function tooManyItems(inventory) {
      return inventory.length >= 20;
    }

    function tooHeavy(inventory, item) {
      const itemWeight = item.getAttribute('weight');
      if (itemWeight === Infinity) { return true; }

      const carriedWeight  = player.getCarriedWeight();
      const maxCarryWeight = player.getMaxCarryWeight();

      return (carriedWeight + itemWeight) > maxCarryWeight;
    }

  };
};
