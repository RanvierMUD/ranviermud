var l10n_file = __dirname + '/../l10n/commands/roomdescs.yml';
var l10n = require('../src/l10n')(l10n_file);
var Command_Util = require('../src/command_util')
  .CommandUtil;

exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {

    var option = args.split(' ')[0].toLowerCase();

    var options = [
      'default',
      'verbose',
      'short'
    ];

    if (option && options.indexOf(option) > -1) {
      player.setPreference('roomdescs', option);
      player.sayL10n(l10n, 'DESCS_SET', option);
      return;
    }

    player.sayL10n(l10n, 'DESCS_OPTIONS', player.getPreference('roomdescs'));
    return;
  }
};
