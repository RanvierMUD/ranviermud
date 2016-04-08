var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10n_file = __dirname + '/../../l10n/scripts/rooms/9.js.yml';
var l10n = require('../../src/l10n')(l10n_file);
var examiner = require('../../src/examine').examine

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {

      var config = {
        poi: [
          'cubby',
          'belongings',
          'cub',
          'shelves',
          'cubbies'
        ],
        found: findNote.bind(null, player, players),
        nothingFound: nothingFound,
        check: player.spot.bind(null, 5, 1)
      };

      return examiner(args, player, players, config);

      function nothingFound() {
        player.sayL10n(l10n, 'NOT_FOUND');
        players.eachIf(p => CommandUtil.otherPlayerInRoom(player, p),
          p => { p.sayL10n(l10n, 'OTHER_NOT_FOUND', player.getName()); });
      }

      function findNote(player, players) {
        var rand = CommandUtil.isCoinFlip();
        var alreadyFound = player.explore('foundnote_' + rand);

        if (!alreadyFound) {
          player.emit('experience', 150);

          player.sayL10n(l10n, 'NOTE_FOUND_' + rand);
          players.eachIf(
            p => CommandUtil.otherPlayerInRoom(player, p),
            p => {
              p.sayL10n(l10n, 'OTHER_FOUND', player.getName());
            });
        } else nothingFound();
      }
    };
  },
};
