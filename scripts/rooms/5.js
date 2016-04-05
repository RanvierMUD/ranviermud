var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10n_file = __dirname + '/../../l10n/scripts/rooms/5.js.yml';
var l10n = require('../../src/l10n')(l10n_file);
var wrap = require('wrap-ansi');

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {

      var poi = [
        "windows",
        "window",
        "curtains",
        "outside",
        "outdoors"
      ];

      var valid = poi.indexOf(args.toLowerCase()) > -1;

      if (valid && CommandUtil.isDaytime()) {
        player.say();
        players.eachIf(p => CommandUtil.otherPlayerInRoom(player, p),
          p => { p.sayL10n(l10n, 'OTHER_LOOKING', player.getName()); });
      } else if (valid) {
        player.sayL10n(l10n, 'DARKNESS');
      } else nothingFound()

      function nothingFound() {
        player.sayL10n(l10n, 'NOT_FOUND');
        players.eachIf(p => CommandUtil.otherPlayerInRoom(player, p),
          p => { p.sayL10n(l10n, 'OTHER_NOT_FOUND', player.getName()); });
      }
    };
  },
};
