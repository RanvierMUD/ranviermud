'use strict';
const l10nFile = __dirname + '/../l10n/commands/drop.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const room = rooms.getAt(player.getLocation());

    args = args.toLowerCase();

    if (args === 'all') {
      dropAll();
      return;
    }

    let item = CommandUtil.findItemInInventory(args, player, true);

    if (!item) {
      player.sayL10n(l10n, 'ITEM_NOT_FOUND');
      return;
    }

    if (item.isEquipped()) {
      item = CommandUtil.findItemInInventory('2.' + args, player, true) || item;
      if (item.isEquipped()) {
        player.sayL10n(l10n, 'ITEM_WORN');
        return;
      }
    }

    drop(item);

    function dropAll() {
      player.getInventory().forEach(item => {
        if (!item.isEquipped()) { drop(item); }
      });
    }

    function drop(item) {
      let playerName = player.getName();

      players.eachIf(
        p => CommandUtil.inSameRoom(p, player),
        p => p.sayL10n(l10n, 'OTHER_DROPS', playerName, item.getShortDesc(p.getLocale()))
      );


      let itemName = item.getShortDesc(player.getLocale());
      player.sayL10n(l10n, 'ITEM_DROP', itemName, false);
      util.log(playerName + " drops " + itemName + " at " + room.getLocation() + ".");

      room.getNpcs().forEach( id => {
        let npc = npcs.get(id);
        npc.emit('playerDropItem', room, player, players, item);
      });

      player.removeItem(item);
      room.addItem(item.getUuid());
      item.setInventory(null);
      item.setRoom(room.getLocation());
    }
  };
};
