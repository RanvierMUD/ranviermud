var l10n_file = __dirname + '/../l10n/commands/examine.yml';
var l10n = require('../src/l10n')(l10n_file);
var CommandUtil = require('../src/command_util')
  .CommandUtil;
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {

    if (args) {
      rooms.getAt(player.getLocation())
        .emit('examine', args, player, players);
      return;
    }

    player.sayL10n(l10n, 'NOTHING_EXAMINED');
    return;
  }
};
