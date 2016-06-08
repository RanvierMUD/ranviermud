'use strict';
const l10nFile = __dirname + '/../l10n/commands/examine.yml';
const l10n = require('../src/l10n')(l10nFile);
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

      const examinableRoom = room.listeners.hasOwnProperty('examine');
      if (examinableRoom) {
        room.emit('examine', args, player, players);
        return;
      }
    }

    player.sayL10n(l10n, 'NOTHING_EXAMINED');
    return;
  }
};
