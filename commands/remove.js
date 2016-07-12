'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const _ = require('../src/helpers');
const l10nFile = __dirname + '/../l10n/commands/remove.yml';
const l10n = require('../src/l10n')(l10nFile);
const util = require('util');
const _ = require('../src/helpers');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player, isDead) => {

    const target = _.firstWord(args);

    if (target === 'all') { return removeAll(); }

    const thing = CommandUtil.findItemInEquipment(target, player, true);

    return remove(thing);

    /// Helper functions ///

    function removeAll() {
      _.values(player.getEquipped())
       .map(id => items.get(id))
       .forEach(remove);
    }

    function remove(item) {
      if (!item && !isDead) {
        player.sayL10n(l10n, 'ITEM_NOT_FOUND');
        return;
      }

      util.log(player.getName() + ' removing ' + item.getShortDesc('en'));

      player.unequip(item);
      if (CommandUtil.hasScript(item, 'remove')) { item.emit('remove', player); }
      if (!isDead) {
        player.sayL10n(l10n, 'REMOVED', item.getShortDesc(player.getLocale()));
      }
      return true;
    }
  };
};
