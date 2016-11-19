'use strict';
const l10nFile = __dirname + '/../l10n/commands/drop.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player, isDead) => {
    const room = rooms.getAt(player.getLocation());

    args = args.toLowerCase();

    if (args === 'all') {
      dropAll();
      return;
    }

    let item = CommandUtil.findItemInInventory(args, player, true);

    if (!item) {
      return player.warn('You cannot drop an item you do not have.');
    }

    if (item.isEquipped()) {
      item = CommandUtil.findItemInInventory('2.' + args, player, true) || item;
      if (item.isEquipped()) {
        return player.warn(`You are wearing ${item.getShortDesc()} right now, and cannot drop it.`);
      }
    }

    drop(item);

    function dropAll() {
      const items     = player.getInventory();
      if (!items.length && !isDead) { return player.say('You have nothing to drop.'); }
      items.forEach(item => drop(item));
    }

    function drop(item) {
      let playerName = player.getName();

      players.eachIf(
        p => CommandUtil.inSameRoom(p, player),
        p => p.sayL10n(l10n, 'OTHER_DROPS', playerName, item.getShortDesc(p.getLocale()))
      );

      let itemName = item.getShortDesc('en');
      if (!isDead) {
        player.sayL10n(l10n, 'ITEM_DROP', itemName, false);
        room.getNpcs().forEach( id => {
          let npc = npcs.get(id);
          npc.emit('playerDropItem', room, rooms, player, players, npc, npcs, item);
        });
      }
      util.log(`${playerName} drops ${itemName} at ${room.getLocation()}.`);

      player.removeItem(item);
      room.addItem(item.getUuid());
      item.setHolder(null);
      item.setRoom(room.getLocation());
    }
  };
};
