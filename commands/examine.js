'use strict';
const l10n_file = __dirname + '/../l10n/commands/examine.yml';
const l10n = require('../src/l10n')(l10n_file);
const CommandUtil = require('../src/command_util')
  .CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    if (args) {
      args = args.trim().toLowerCase();
      const room = rooms.getAt(player.getLocation());

      util.log(player.getName() + ' is searching for ' + args);
      util.log('  in ' + room.getTitle('en'));

      room.emit('examine', args, player, players);
      return;
    }

    player.sayL10n(l10n, 'NOTHING_EXAMINED');
    return;
  }
};
