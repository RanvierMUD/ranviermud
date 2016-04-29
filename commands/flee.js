'use strict';
const CommandUtil = require('../src/command_util')
  .CommandUtil;
const Random = require('../src/random').Random;
const move = require('../src/commands').Commands.move;
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

    const opponent = npcs.get(player.isInCombat().getUuid());
    const fleed = Random.coinFlip();
    const room = rooms.getAt(player.getLocation());
    const exit = Random.fromArray(room.getExits());

    if (fleed && move(exit, player)) {
      opponent.setInCombat(false);
      player.setInCombat(false);

      player.sayL10n(l10n, 'FLEE_SUCCEED');
      util.log(player.getName() + " fled successfully.");
      return;
    }

    player.sayL10n(l10n, "FLEE_FAIL");
    return;
  };
};
