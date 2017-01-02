const CommandUtil = require('../../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../../l10n/scripts/rooms/8.js.yml';
const l10n = require('../../src/l10n')(l10nFile);
const examiner = require('../../src/examine').examine;

//TODO: Redo/refactor all examine listeners.

exports.listeners = {

  examine: l10n => {
    return (args, player, players) => {
      const config = {
        poi: [
            'crates',
            'boxes',
            'bags',
            'food',
            'sack',
            'sacks',
            'storage'
          ],
        found: findFood.bind(null, player, players),
        check: player.spot.bind(null, 3, 1)
      };

      return examiner(args, player, players, config);
    };
  }
};

function findFood(player, players) {
  player.emit('regen', { bonus: 2 , duration: 10000 });
  player.sayL10n(l10n, 'FOUND_FOOD');
  players.eachIf(p => CommandUtil.inSameRoom(player, p),
    p => {
      p.sayL10n(l10n, 'OTHER_FOUND_FOOD', player.getName());
      player.sayL10n(l10n, 'SHARE_FOOD', p.getName());
      p.emit('regen', 2);
    });

}
