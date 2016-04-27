'use strict';
const l10n_file = __dirname + '/../l10n/commands/help.yml';
const l10n = require('../src/l10n')(l10n_file);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    const hr = () => player.sayL10n(l10n, 'HR');

    hr();

    if (!args) {
      player.writeL10n(l10n, 'HELP');
      hr();
      return;
    }

    args = args.toLowerCase().trim();

    if (args in Commands.player_commands) {
      try {
        player.sayL10n(l10n, args.toUpperCase());

      } catch (err) {
        const errMsg = "" + player.getName() + " attempted to get a helpfile for " + args + " and this happened: ";
        util.log(errMsg, err);
        player.writeL10n(l10n, 'NO_HELP_FILE');

      } finally {
        hr();
        return;
      }
    }
    player.writeL10n(l10n, 'NOT_FOUND');
    hr();
    return;
  };
};
