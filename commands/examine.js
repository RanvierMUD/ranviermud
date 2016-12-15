'use strict';
const l10nFile = __dirname + '/../l10n/commands/examine.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;

const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    if (!player.hasEnergy(1, items)) { return player.noEnergy(); }

    if (args) {
      args = args.trim().toLowerCase();
      const room = rooms.getAt(player.getLocation());

      util.log(player.getName() + ' is searching for ' + args);
      util.log('  in ' + room.getTitle('en'));

      if (CommandUtil.hasScript(room, 'examine')) { return room.emit('examine', args, player, players); }
    }

    return player.sayL10n(l10n, 'NOTHING_EXAMINED');
  }
};
