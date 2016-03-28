var l10n_file = __dirname + '/../l10n/commands/stance.yml';
var l10n = require('../src/l10n')(l10n_file);
var Command_Util = require('../src/command_util')
  .CommandUtil;

exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {

    var stance = args.split(' ')[0].toLowerCase();

    var stances = [
      'cautious',
      'normal',
      'berserk',
      'precise'
    ];

    if (stance && stances.indexOf(stance) > -1) {
      player.setPreference('stance', stance);
      player.sayL10n(l10n, 'STANCE_SET', stance);
      players.eachIf(
        CommandUtil.otherPlayerInRoom,
        p => {
          p.sayL10n('OTHER_STANCE', player.getName(), stance);
        });
      return;
    }

    player.sayL10n(l10n, 'STANCE', player.getPreference('stance'));
    return;
  }
};
