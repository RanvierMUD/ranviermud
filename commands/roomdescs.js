'use strict';
const l10nFile = __dirname + '/../l10n/commands/roomdescs.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util')
  .CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    const option = args.split(' ')[0].toLowerCase();

    const options = [
      'default',
      'verbose',
      'short'
    ];

    if (option && options.indexOf(option) > -1) {
      player.setPreference('roomdescs', option);
      player.sayL10n(l10n, 'DESCS_SET', option);
      return;
    }

    player.sayL10n(l10n, 'DESCS_OPTIONS', player.getPreference('roomdescs'));
    return;
  }
};
