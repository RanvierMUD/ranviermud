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
        players.eachIf(p => CommandUtil.otherPlayerInRoom(player, p),
          p => { p.sayL10n(l10n, 'OTHER_NOT_FOUND', player.getName()); });
      }
    };
  }

};

function findFood(player, players) {

  player.emit('regen', 2);
  player.sayL10n(l10n, 'FOUND_FOOD');
  players.eachIf(p => CommandUtil.otherPlayerInRoom(player, p),
    p => {
      p.sayL10n(l10n, 'OTHER_FOUND_FOOD', player.getName());
      player.sayL10n(l10n, 'SHARE_FOOD', p.getName());
      p.emit('regen', 2);
    });

}
