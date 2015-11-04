var l10n_file = __dirname + '/../l10n/commands/help.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {
    if (!args) {
      player.sayL10n(l10n, 'USING_HELP');
      return;
    }

    var commands = {};
    for (var command in Commands.player_commands) {
      commands[command] = true;
    }

    if (commands[args]) {
      player.sayL10n(l10n, args.toUpperCase());
      return;
    }

    player.sayL10n(l10n, 'NOT_FOUND');
    return;
  };
};