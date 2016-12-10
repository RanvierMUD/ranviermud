'use strict';

const CommandUtil = require('../src/command_util').CommandUtil;
const Broadcast   = require('../src/broadcast').Broadcast;
const _           = require('../src/helpers');
const util        = require('util');


exports.command = (rooms, items, players, npcs, Commands) => 
  (args, player) => {

    // syntax 'give [item] [player]' //TODO: Make more flexible
    if (player.isInCombat()) {
      return player.say(`Now is not the time to be handing out presents...`);
    }

    args = _.removePreposition(_.splitArgs(args));

    if (!args.length) {
      return player.say(`You need to specify what you're trying to give and to whom.`);
    }

    const item = CommandUtil.findItemInInventory(args[0], player, true);

    if (!item) {
      return player.say(`You can not find ${args[0]} in your inventory.`);
    }

    let targetPlayer = args[1];
    let targetFound  = false;

    if (!targetPlayer) {
      return player.say(`You need to specify to whom you want to give ${item.getShortDesc()}.`);
    }

    const isEquipped = item.isEquipped()
    const isHolding  = player.isHolding(item);

    const needsToHandOff = isEquipped && isHolding; 
    if (isEquipped && !isHolding) {
      return player.say(`You cannot give ${item.getShortDesc()} away, you are using it.`);
    }

    targetPlayer = targetPlayer.toLowerCase();

    players.eachIf(
      target => CommandUtil.inSameRoom(player, target),
      target => checkForTarget(target));

    function checkForTarget(target) {
        if (target.getName().toLowerCase() === targetPlayer) {
          giveItemToPlayer(player, target, players, item, items, rooms, needsToHandOff);
          targetFound = true;
        }
      }

    if (!targetFound) {
      return player.say(`It seems that ${_.capitalize(targetPlayer)} is not in this room.`);
    }
    
};

function giveItemToPlayer(player, target, players, item, items, rooms, needsToHandOff) {

  const room   = rooms.getAt(player.getLocation());
  const toRoom = Broadcast.toRoom(room, player, target, players);
  
  const itemName   = item.getShortDesc();
  const targetName = target.getName();
  const playerName = player.getName();

  const giveMessages = {
    firstPartyMessage: `You give the ${itemName} to ${targetName}.`,
    secondPartyMessage: `${playerName} gives you the ${itemName}.`,
    thirdPartyMessage: `${playerName} gives the ${itemName} to ${targetName}.`
  };

  const failedGiveMessages = {
    firstPartyMessage: `You try to give the ${itemName} to ${targetName} but they have nowhere to put it.`,
    secondPartyMessage: `${playerName} tries to give you the ${itemName}, but your hands are full and you've nowhere to put it.`,
    thirdPartyMessage: `${playerName} tries to give ${targetName} the ${itemName}, but ${targetName} reluctantly turns them down.`
  };

  util.log(`Attempting: ${giveMessages.thirdPartyMessage}`);

  // Should be able to give if they have an open hand (target.canHold) or container.
  const size = item.getAttribute('size');
  const targetCanHold   = target.canHold();
  const targetContainer = target.getContainerWithCapacity(items, size);

  if (!targetCanHold && !targetContainer) {
    return toRoom(failedGiveMessages);
  }

  const container = items.get(item.getContainer())
  if (container)      { container.removeItem(item); }
  if (needsToHandOff) { player.unequip(item, items, players, true); }
  
  if (targetCanHold) {
    target.equip(target.findHoldingLocation(), item);
  } else if (targetContainer) {
    targetContainer.addItem(item);
    target.say(`You place ${itemName} into your ${targetContainer.getShortDesc()}.`);
  } 

  player.removeItem(item);
  item.setHolder(target.getName());

  target.addItem(item);

  player.emit('action', 1, items);
  target.emit('action', 1, items);

  toRoom(giveMessages);

}