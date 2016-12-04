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
          giveItemToPlayer(player, target, item);
          targetFound = true;
        }
      }

    if (!targetFound) {
      return player.say(`It seems that ${_.capitalize(targetPlayer)} is not in this room.`);
    }

    //FIXME: Get rid of try catch block and make this work with containers
    function giveItemToPlayer(playerGiving, playerReceiving, itemGiven) {
      
      const room   = rooms.getAt(playerGiving.getLocation());
      const toRoom = 
      try {
        util.log(playerReceiving.getName() + ' gets ', itemGiven.getShortDesc('en') + ' from ' + playerGiving.getName());
        playerGiving.sayL10n(l10n, 'ITEM_GIVEN', itemGiven.getShortDesc(
          playerGiving.getLocale()), playerReceiving.getName());
        playerReceiving.sayL10n(l10n, 'ITEM_RECEIVED', itemGiven.getShortDesc(
          playerReceiving.getLocale()), playerGiving.getName());

        player.emit('action', 1, items);
        playerReceiving.emit('action', 1, items);

      } catch (e) {
        util.log("Error when giving an item ", e);
        util.log("playerReceiving: ", playerReceiving.getName());
        util.log("playerGiving: ", playerGiving.getName());
        util.log("Item: ", item);

        playerGiving.sayL10n(l10n, 'GENERIC_ITEM_GIVEN', playerReceiving.getName());
        playerReceiving.sayL10n(l10n, 'GENERIC_ITEM_RECEIVED', playerGiving.getName());
      }

      playerGiving.removeItem(itemGiven);
      itemGiven.setHolder(playerReceiving.getName());
      playerReceiving.addItem(itemGiven);
      player.emit('action', 1, items);
      playerReceiving.emit('action', 1, items);

    }
};
