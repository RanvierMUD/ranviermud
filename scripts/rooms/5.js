var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10n_file = __dirname + '/../../l10n/scripts/rooms/5.js.yml';
var l10n = require('../../src/l10n')(l10n_file);
var examiner = require('../../src/examine').examine;

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {

      var config = {
        poi: [
          "windows",
          "window",
          "curtains",
          "outside",
          "outdoors"
        ],
        found: lookOutside,
        nothingFound: nothingFound
      };

      return examiner(args, player, players, config);

      function nothingFound() {
        player.sayL10n(l10n, 'NOT_FOUND');
        players.eachIf(p => CommandUtil.otherPlayerInRoom(player, p),
          p => { p.sayL10n(l10n, 'OTHER_NOT_FOUND', player.getName()); });
      }


      function lookOutside() {
        if (CommandUtil.isDaytime()) {
          player.sayL10n(l10n, 'WALL');
          players.eachIf(p => CommandUtil.otherPlayerInRoom(player, p),
            p => { p.sayL10n(l10n, 'OTHER_LOOKING', player.getName()); });
        } else
          player.sayL10n(l10n, 'DARKNESS');
      }
    }
  }

};
