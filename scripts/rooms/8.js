var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10n_file = __dirname + '/../../l10n/scripts/rooms/8.js.yml';
var l10n = require('../../src/l10n')(l10n_file);
var examiner = require('../../src/examine').examine;


exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {
      var config = {
        poi: [
            'crates',
            'boxes',
            'bags',
            'food',
            'sack',
            'sacks'
          ],
        found: findFood.bind(null, player, players),
        check: player.spot.bind(null, 3, 1)
      };

      return examiner(args, player, players, config);
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
