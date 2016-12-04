'use strict';
const l10nFile = __dirname + '/../l10n/commands/give.yml';
const l10n        = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const Broadcast   = require('../src/broadcast').Broadcast;
const _           = require('../src/helpers');
const util        = require('util');


exports.command = (rooms, items, players, npcs, Commands) => 
  (args, player) => {

    // syntax 'give [item] [player]'
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

    if (item.isEquipped()) {
      return player.say(`You cannot give ${item.getShortDesc()} away, you are using it.`);
    }
    
    let targetPlayer = args[1];
    let targetFound  = false;

    if (!targetPlayer) {
      return player.say(`You need to specify to whom you want to give ${item.getShortDesc()}.`);
    }

    targetPlayer = targetPlayer.toLowerCase();

    players.eachIf(
      target => CommandUtil.inSameRoom(player, target),
      target => checkForTarget(target));

    function checkForTarget(target) {
        if (target.getName().toLowerCase() === targetPlayer) {
          giveItemToPlayer(player, target, players, item, items, rooms);
          targetFound = true;
        }
      }

    if (!targetFound) {
      return player.say(`It seems that ${_.capitalize(targetPlayer)} is not in this room.`);
    }
    
};

function giveItemToPlayer(player, target, players, item, items, rooms) {

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

  util.log(`Attempting: ${giveMessages.thirdPartyMessage}`);

  const container = items.get(item.getContainer())
  if (container) { container.removeItem(item); }

  const targetContainer = target //TODO: Finish

  player.removeItem(item);
  item.setHolder(target.getName());

  target.addItem(item);

  player.emit('action', 1, items);
  target.emit('action', 1, items);

  toRoom(giveMessages);


}