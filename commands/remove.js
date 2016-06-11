'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/remove.yml';
const l10n = require('../src/l10n')(l10nFile);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const target = args.toLowerCase().split(' ')[0];

    if (target === 'all') { return removeAll(); }

    const thing = CommandUtil.findItemInInventory(target, player, true);

    return remove(thing);

    /// Helper functions

    function removeAll() {
      CommandUtil
        .values(player.getEquipped())
        .map(id => items.get(id))
        .forEach(remove);
    }

    function remove(item) {
      if (!item) {
        player.sayL10n(l10n, 'ITEM_NOT_FOUND');
        return false;
      }

      if (!item.isEquipped()) {
        item = CommandUtil.findItemInInventory('2.' + target, player, true);
        if (!item || !item.isEquipped()) {
          player.sayL10n(l10n, 'ITEM_NOT_EQUIPPED');
          return false;
        }
      }

      util.log(player.getName() + ' removing ' + item.getShortDesc('en'));
      player.unequip(item);
      player.sayL10n(l10n, 'REMOVED', item.getShortDesc(player.getLocale()));
      return true;
    }

  };
};
