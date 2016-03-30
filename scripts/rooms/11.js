var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10n_file = __dirname + '/../../l10n/scripts/rooms/11.js.yml';
var l10n = require('../../src/l10n')(l10n_file);

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {
      var poi = [
        'ground',
        'floor',
        'stains',
        'blood',
        'rust'
      ];

      if (poi.indexOf(args.toLowerCase()) > -1 && player.spot(3, 1)) {
        seeDisturbance(player, players);
        if (!player.explore('noticed bloodstains in cage')) {
          player.emit('experience', 100);
        }
      } else {
        player.sayL10n(l10n, 'NOT_FOUND');
      }

    };
  },

};

function seeDisturbance(player, players) {
  player.setAttribute('sanity', player.getAttribute('sanity') -
    5);
  player.sayL10n(l10n, 'DISCOMFORT');
  players.eachIf(p => CommandUtil.otherPlayerInRoom(p),
    p => { p.sayL10n(l10n, 'OTHER_DISCOMFORT'); });
}
