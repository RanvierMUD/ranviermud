var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10n_file = __dirname + '/../../l10n/scripts/rooms/8.js.yml';
var l10n = require('../../src/l10n')(l10n_file);

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {
      var poi = [
        'crates',
        'boxes',
        'bags',
        'food',
        'sack',
        'sacks'
      ];

      var valid = poi.indexOf(args) > -1;

      if (valid && player.spot(3, 1)) {
        findFood(player, players);
      } else {
        player.sayL10n(l10n, 'NOT_FOUND');
      }
    };
  }

};

function findFood(player, players) {

  player.emit('regen');
  player.sayL10n(l10n, 'FOUND_FOOD');
  players.eachIf(p => CommandUtil.otherPlayerInRoom(p),
    p => { p.sayL10n(l10n, 'OTHER_FOUND_FOOD', player.getName()); });
}
