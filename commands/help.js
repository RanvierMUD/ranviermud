var l10n_file = __dirname + '/../l10n/commands/help.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {

    var hr = function() {
      player.say("\n=======================");
    };
    
    hr();

    if (!args) {
      player.writeL10n(l10n, 'HELP');
      hr();
      return;
    }

    var commands = {};
    for (var command in Commands.player_commands) {
      commands[command] = true;
    }

    if (commands[args]) {
      try {
        player.writeL10n(l10n, args.toUpperCase());
      } catch (err) {
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