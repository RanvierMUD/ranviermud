'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const l10n_file = __dirname + '/../l10n/commands/remove.yml';
const l10n = require('../src/l10n')(l10n_file);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const target = args.split(' ')[0];
    let thing = CommandUtil.findItemInInventory(target, player,
      true);

    if (!thing) {
      player.sayL10n(l10n, 'ITEM_NOT_FOUND');
      return;
    }

    if (!thing.isEquipped()) {
      thing = CommandUtil.findItemInInventory('2.' + target, player, true);
      if (!thing || !thing.isEquipped()) {
        player.sayL10n(l10n, 'ITEM_NOT_EQUIPPED');
        return;
      }
    }

    util.log(player.getName() + ' removing ' + thing.getShortDesc('en'));
    player.unequip(thing);
    player.sayL10n(l10n, 'REMOVED', thing.getShortDesc(player.getLocale()));

  };
};
