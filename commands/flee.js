var CommandUtil = require('../src/command_util')
  .CommandUtil;
var move = require('../src/commands')
  .Commands.move;
var l10n_file = __dirname + '/../l10n/commands/flee.yml';
var util = require('util');
var l10n = require('../src/l10n')(l10n_file);

exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {

    if (!player.isInCombat()) {
      player.sayL10n(l10n, "NO_FIGHT");
      return;
    }

    util.log(player.getName() + ' is trying to flee.');
    util.log(player.isInCombat().getShortDesc('en'));

    var opponent = npcs.get(player.isInCombat().getUuid());
    var fleed = CommandUtil.isCoinFlip();
    var exit = CommandUtil.getRandomFromArr(
      rooms.getAt(player.getLocation())
      .getExits());

    if (fleed) {
      opponent.setInCombat(false);
      player.setInCombat(false);
      
      player.sayL10n(l10n, 'FLEE_SUCCEED');
      move(exit, player);
      return;
    }

    player.sayL10n(l10n, "FLEE_FAIL");
    return;
  };
};
