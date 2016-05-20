'use strict';
//TODO: Refactor to be a channel.
const l10nFile = __dirname + '/../l10n/commands/whisper.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    args = args.split(' ');

    const target = args.shift();
    const msg = args.join(' ');
    const playerName = player.getName();
    let targetFound = true;

    if (args.length > 0) {
      targetFound = false;
      players.eachIf(
        p => CommandUtil.otherPlayerInRoom(p, player),
        p => {
          if (p.getName().toLowerCase() === target.toLowerCase()) {
            p.sayL10n(l10n, 'THEY_WHISPER', playerName, msg);
            targetFound = true;
          } else {
            p.sayL10n(l10n, 'OTHERS_WHISPER', playerName, target);
          }
          p.prompt();
        });
      if (targetFound) {
        player.sayL10n(l10n, 'YOU_WHISPER', target, msg);
        return;
      }
    }

    if (!targetFound) {
      player.sayL10n(l10n, 'NO_TARGET_FOUND');
      return;
    }

    player.sayL10n(l10n, 'NOTHING_SAID');

  }
};
