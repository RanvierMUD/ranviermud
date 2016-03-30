var l10n_file = __dirname + '/../l10n/commands/examine.yml';
var l10n = require('../src/l10n')(l10n_file);
var CommandUtil = require('../src/command_util')
  .CommandUtil;
var util = require('util');

exports.command = function(rooms, items, players, npcs, Commands) {
  return (args, player) => {
    if (args) {
      args = args.trim().toLowerCase();

      util.log(player.getName() + ' is searching for ' + args);
      util.log('in ' + rooms.getAt(player.getLocation()).getTitle('en'));

      rooms.getAt(player.getLocation())
        .emit('examine', args.trim(), player, players);
      return;
    }

    player.sayL10n(l10n, 'NOTHING_EXAMINED');
    return;
  }
};
