var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10n_file = __dirname + '/../../l10n/scripts/rooms/11.js.yml';
var l10n = require('../../src/l10n')(l10n_file);

exports.listeners = {
  playerEnter: l10n => {
    return (player, players) => {
      if (getRand() === 3) {
        seeDisturbance(player, players);
      }
    };
  },

//TODO: Use cleverness stat for spot checks such as this.
  examine: l10n => {
    return (args, player, players) => {
      var poi = [
        'ground',
        'floor',
        'stains',
        'blood',
        'rust'
      ];

      if (poi.indexOf(args.toLowerCase()) > -1) {
        seeDisturbance(player, players);
        if (!player.explore('noticed bloodstains in cage')) {
          player.emit('experience', 30);
        }
      }
    };
  }

};

function getRand() {
  return Math
    .floor(Math
      .random() * 5) + 1;
}

function seeDisturbance(player, players) {
  player.setAttribute('sanity', player.getAttribute('sanity') -
    getRand());
  player.sayL10n(l10n, 'DISCOMFORT');
  players.eachIf(p => CommandUtil.otherPlayerInRoom(p),
    p => { p.sayL10n(l10n, 'OTHER_DISCOMFORT'); });
}
