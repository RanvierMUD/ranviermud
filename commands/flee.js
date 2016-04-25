'use strict';
const CommandUtil = require('../src/command_util')
  .CommandUtil;
const Random = require('../src/random').Random;
const move = require('../src/commands')
  .Commands.move;
const l10n_file = __dirname + '/../l10n/commands/flee.yml';
const util = require('util');
const l10n = require('../src/l10n')(l10n_file);

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    if (!player.isInCombat()) {
      player.sayL10n(l10n, "NO_FIGHT");
      return;
    }

    util.log(player.getName() + ' is trying to flee.');
    util.log(player.isInCombat().getShortDesc('en'));

    let opponent = npcs.get(player.isInCombat().getUuid());
    let fleed = Random.coinFlip();
    let exit = Random.fromArray(
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
