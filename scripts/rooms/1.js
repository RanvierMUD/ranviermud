var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10nFile = __dirname + '/../../l10n/scripts/rooms/1.js.yml';
var l10n = require('../../src/l10n')(l10nFile);
var examiner = require('../../src/examine').examine;

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {

      var config = {
        poi: {
          vats: found.bind(null, 'BEER'),
          taps: found.bind(null, 'BEER'),
          hoses: found.bind(null, 'BEER'),
          bar: found.bind(null, 'BEER'),
          lanterns: found.bind(null, 'LIGHTS'),
          lights: found.bind(null, 'LIGHTS')
        }
      };

      return examiner(args, player, players, config);

      function found(what) {
        player.sayL10n(l10n, what);
        players.eachIf(
          p => CommandUtil.inSameRoom(player, p),
          p => { p.sayL10n(l10n, what + '_OTHER', player.getName()) });
      }

    };
  },
};
