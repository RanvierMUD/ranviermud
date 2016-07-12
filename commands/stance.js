'use strict';

const util = require('util');

const l10nFile = __dirname + '/../l10n/commands/stance.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const _ = require('../src/helpers');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    const stance = args.split(' ')[0].toLowerCase();

    const stances = [
      'cautious',
      'normal',
      'berserk',
      'precise'
    ];

    if (stance && _.has(stances, stance)) {
      player.setPreference('stance', stance);
      player.sayL10n(l10n, 'STANCE_SET', stance);
      players.eachIf(
        p => CommandUtil.inSameRoom(player, p),
        p => p.sayL10n('OTHER_STANCE', player.getName(), stance));
      return;
    }

    player.sayL10n(l10n, 'STANCE', player.getPreference('stance'));
  }
};
