'use strict';
const l10n_file = __dirname + '/../l10n/commands/give.yml';
const l10n = require('../src/l10n')(l10n_file);
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    // syntax 'give [item] [player]'
    if (player.isInCombat()) {
      player.sayL10n(l10n, 'GIVE_COMBAT');
      return;
    }

    args = args.toLowerCase().split(' ');

    if (!args.length) {
      player.sayL10n(l10n, 'NO_ITEM_OR_TARGET');
      return;
    }

    let to = args.indexOf('to');
    if (to > -1) args.splice(to, 1);
    util.log(args);

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
      CommandUtil.otherPlayerInRoom.bind(null, player),
      checkForTarget
      );

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

    function giveItemToPlayer(playerGiving, playerReceiving, itemGiven) {
      try {
        util.log(playerReceiving.getName() + ' gets ', itemGiven.getShortDesc('en') + ' from ' + playerGiving.getName());
        playerGiving.sayL10n(l10n, 'ITEM_GIVEN', itemGiven.getShortDesc(
          playerGiving.getLocale()), playerReceiving.getName());
        playerReceiving.sayL10n(l10n, 'ITEM_RECEIVED', itemGiven.getShortDesc(
          playerReceiving.getLocale()), playerGiving.getName());
      } catch (e) {
        util.log("Error when giving an item ", e);
        util.log("playerReceiving: ", playerReceiving.getName());
        util.log("playerGiving: ", playerGiving.getName());
        util.log("Item: ", item);

        playerGiving.sayL10n(l10n, 'GENERIC_ITEM_GIVEN', playerReceiving.getName());
        playerReceiving.sayL10n(l10n, 'GENERIC_ITEM_RECEIVED', playerGiving
          .getName());
      }
      playerGiving.removeItem(itemGiven);
      itemGiven.setInventory(playerReceiving.getName());
      playerReceiving.addItem(itemGiven);
    }
  };
};
