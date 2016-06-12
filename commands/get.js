'use strict';
const l10nFile = __dirname + '/../l10n/commands/get.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    // No picking stuff up in combat
    if (player.isInCombat()) {
      player.sayL10n(l10n, 'GET_COMBAT');
      return;
    }

    const room = rooms.getAt(player.getLocation());
    const playerName = player.getName();

    if (inventoryFull()) {
      player.sayL10n(l10n, 'CARRY_MAX');
      return;
    }

    if (args.toLowerCase() === "all") {
      getAllItems(room);
      return;
    }

    const item = CommandUtil.findItemInRoom(items, args, room, player);
    if (!item) {
      player.sayL10n(l10n, 'ITEM_NOT_FOUND');
      return;
    }
    pickUp(item);

    function pickUp(item) {
      item = items.get(item);
      player.sayL10n(l10n, 'ITEM_PICKUP', item.getShortDesc(player.getLocale()));
      item.setRoom(null);
      item.setInventory(playerName);
      player.addItem(item);
      room.removeItem(item.getUuid());

      util.log(playerName + ' picked up ' + item.getShortDesc('en'));

      players.eachIf(
        (p) => CommandUtil.inSameRoom(p, player),
        (p) => p.sayL10n(l10n, 'OTHER_PICKUP', playerName, item.getShortDesc(p.getLocale()))
      );
    }

    function getAllItems(room) {
      const items = room.getItems();
      items.forEach( item => {
        if (!inventoryFull()) pickUp(item);
        else player.sayL10n(l10n, 'CARRY_MAX');
      });
    }

    //TODO: Change to calculate based on character's strength and pack size vs. item weight/size.
    function inventoryFull() {
      return player.getInventory().length >= 20;
    }

  };
};
