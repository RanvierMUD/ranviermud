var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10n_file = __dirname + '/../../l10n/scripts/rooms/8.js.yml';
var l10n = require('../../src/l10n')(l10n_file);

exports.listeners = {

  //TODO: Use cleverness stat for spot checks such as this.
  examine: l10n => {
    return (args, player, players) => {
      var poi = [
        'crates',
        'boxes',
        'bags',
        'food'
      ];

      if (poi.indexOf(args.toLowerCase()) > -1 && getRand() > 3) {
        findFood(player, players);
      }
    };
  }

};

function getRand() {
  return Math
    .floor(Math
      .random() * 5) + 1;
}

function findFood(player, players) {

  player.setAttribute('health', player.getAttribute('health') +
    getRand());
  player.sayL10n(l10n, 'FOUND_FOOD');
  players.eachIf(p => CommandUtil.otherPlayerInRoom(p),
    p => { p.sayL10n(l10n, 'OTHER_FOUND_FOOD', player.getName()); });
}
