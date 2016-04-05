var CommandUtil = require('../../src/command_util')
  .CommandUtil;
var l10n_file = __dirname + '/../../l10n/scripts/rooms/9.js.yml';
var l10n = require('../../src/l10n')(l10n_file);

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {
      var poi = [
        'cubby',
        'belongings',
        'cub',
        'shelves'
      ];

      var valid = poi.indexOf(args.toLowerCase()) > -1;

      if (valid && player.spot(5, 1)) {
        findNote(player, players);
      } else nothingFound();

      function nothingFound() {
        player.sayL10n(l10n, 'NOT_FOUND');
        players.eachIf(p => CommandUtil.otherPlayerInRoom(player, p),
          p => { p.sayL10n(l10n, 'OTHER_NOT_FOUND', player.getName()); });
      }

      function findNote(player, players) {
        var rand = CommandUtil.isCoinFlip();
        if (!player.explore('foundnote_' + rand)) {
          player.sayL10n(l10n, 'NOTE_FOUND_' + rand);
          player.emit('experience', 150);
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
