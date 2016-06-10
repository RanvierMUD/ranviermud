'use strict';
const l10nFile = __dirname + '/../l10n/commands/emote.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const self = player.getName();
    if (args) {
      player.say(self + " " + args);
      players.eachIf(
        CommandUtil.inSameRoom.bind(null, player),
        target => target.say(self + " " + args));
      util.log(self + ' emotes: ' + args);
      return;
    }
    player.sayL10n(l10n, 'NOTHING_EMOTED');
    return;
  }
};
