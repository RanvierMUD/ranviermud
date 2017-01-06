'use strict';
const util = require('util');

const CommandUtil = require('../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/remove.yml';
const l10n = require('../src/l10n')(l10nFile);
const _ = require('../src/helpers');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player, isDead) => {

    const target = _.firstWord(args);

    if (target === 'all') { return Commands.player_commands.drop.execute('all', player); }

    const thing = CommandUtil.findItemInEquipment(items, target, player, true);
    
    if (thing.isEquipped()) {
      return remove(thing);
    } else {
      return player.warn(`${thing.getShortDesc()} is not equipped.`);
    }

    function remove(item) {
      if (!item && !isDead) { return player.warn(`You don't seem to have that...`); }

      util.log(player.getName() + ' removing ' + item.getShortDesc('en'));

      const location = player.unequip(item, items, players);
      if (isDead)    { return; }
      if (!location) { return player.say(`You are unable to unequip ${item.getShortDesc()}.`); }
      
      const room = rooms.getAt(player.getLocation());
      item.emit('remove', location, room, player, players);
    }
  };
};
