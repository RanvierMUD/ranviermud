'use strict';
const l10nFile = __dirname + '/../l10n/commands/help.yml';
const l10n = require('../src/l10n')(l10nFile);
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

      try {
        player.sayL10n(l10n, args.toUpperCase());

      } catch (err) {
        const errMsg = "" + player.getName() + " attempted to get a helpfile for " + args + " and this happened: ";
        util.log(errMsg, err);

        args in Commands.player_commands ?
          player.writeL10n(l10n, 'NO_HELP_FILE') : player.writeL10n(l10n, 'NOT_FOUND');
          
      } finally {
        hr();
      }
  };
};
