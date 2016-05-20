var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10n_file = __dirname + '/../../l10n/scripts/rooms/11.js.yml';
var l10n = require('../../src/l10n')(l10n_file);
var examiner = require('../../src/examine').examine;

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {
      var config = {
        poi: [
          'ground',
          'floor',
          'stains',
          'blood',
          'rust'
        ],
        found: seeDisturbance.bind(null, player, players),
        check: player.spot.bind(null, 3, 1)
      }

      return examiner(args, player, players, config);
    };
  },
};

function seeDisturbance(player, players) {
  var alreadyFound = player
    .explore('noticed bloodstains in cage');

  if (!alreadyFound) {
    player.emit('experience', 100);
  }

  var sanity = player.getAttribute('sanity') - 5;
  player.setAttribute('sanity', sanity);

  player.sayL10n(l10n, 'DISCOMFORT');
  players.eachIf(p => CommandUtil.inSameRoom(p, player),
    p => { p.sayL10n(l10n, 'OTHER_DISCOMFORT'); });
}
