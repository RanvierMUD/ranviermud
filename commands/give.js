'use strict';
const l10nFile = __dirname + '/../l10n/commands/give.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');
const _ = require('../src/helpers');


//TODO: Refactor/redo due to the new container functionality....
exports.command = (rooms, items, players, npcs, Commands) => 
  (args, player) => {

    // syntax 'give [item] [player]'
    if (player.isInCombat()) {
      return player.sayL10n(l10n, 'GIVE_COMBAT');
    }

    args = _.splitArgs(args);

    if (!args.length) {
      player.sayL10n(l10n, 'NO_ITEM_OR_TARGET');
      return;
    }

    let toIndex = args.indexOf('to');
    if (toIndex > -1) { args.splice(to, 1); }

    //FIXME: Make it impossible to give an item if the other player cannot receive it.
    const item = CommandUtil.findItemInInventory(args[0], player, true);
    const room = rooms.getAt(player.getLocation());
    let targetPlayer = args[1];
    let targetFound  = false;

    if (!item) {
      player.sayL10n(l10n, 'ITEM_NOT_FOUND', args[0]);
      return;
    }

    if (!targetPlayer) {
      player.sayL10n(l10n, 'NO_ITEM_OR_TARGET');
      return;
    }

    targetPlayer = targetPlayer.toLowerCase();

    players.eachIf(
      CommandUtil.inSameRoom.bind(null, player),
      checkForTarget);

    function checkForTarget(target) {
        if (target.getName().toLowerCase() === targetPlayer) {
          giveItemToPlayer(player, target, item);
          targetFound = true;
        }
      }

    if (!targetFound) {
      player.sayL10n(l10n, "PLAYER_NOT_FOUND", targetPlayer);
      return;
    }

    //FIXME: Get rid of try catch block and make this work with containers
    function giveItemToPlayer(playerGiving, playerReceiving, itemGiven) {
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
