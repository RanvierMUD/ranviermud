const l10n_file = __dirname + '/../l10n/commands/stance.yml';
const l10n = require('../src/l10n')(l10n_file);
const Command_Util = require('../src/command_util')
  .CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    const stance = args.split(' ')[0].toLowerCase();

    const stances = [
      'cautious',
      'normal',
      'berserk',
      'precise'
    ];

    if (stance && stances.indexOf(stance) > -1) {
      player.setPreference('stance', stance);
      player.sayL10n(l10n, 'STANCE_SET', stance);
      players.eachIf(
        p => CommandUtil.otherPlayerInRoom(player, p),
        p => p.sayL10n('OTHER_STANCE', player.getName(), stance)
      );
      return;
    }

    player.sayL10n(l10n, 'STANCE', player.getPreference('stance'));
    return;
  }
};
