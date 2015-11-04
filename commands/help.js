var l10n_file = __dirname + '/../l10n/commands/help.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {

    function commandNotFound() {
      player.writeL10n(l10n, 'NOT_FOUND');
      return;
    }

    if (!args) {
      player.writeL10n(l10n, 'HELP');
      return;
    }

    var commands = {};
    for (var command in Commands.player_commands) {
      commands[command] = true;
    }

    if (commands[args]) {
      try {
        player.writeL10n(l10n, args.toUpperCase());
        return;
      } catch (err) {
   		player.writeL10n(l10n, 'NO_HELP_FILE');
   		return;
      }
    }
    player.writeL10n(l10n, 'NOT_FOUND');
    return;
  };
};