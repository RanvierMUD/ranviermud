'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const Random = require('../src/random').Random;
const move = require('../src/commands').Commands.move;
const l10nFile = __dirname + '/../l10n/commands/flee.yml';
const util = require('util');
const l10n = require('../src/l10n')(l10nFile);

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

    if (!player.hasEnergy(2, items)) { return player.noEnergy(); }

    if (!player.isInCombat()) {
      return player.warn('You have nothing to flee from... right?');
    }

    util.log(player.getName() + ' is trying to flee from:');

    const opponents = player.getInCombat();

    const fleed = Random.coinFlip();
    const room  = rooms.getAt(player.getLocation());
    const exit  = Random.fromArray(room.getExits());

    if (fleed && move(exit, player)) {
      opponents.forEach(opp => opp.removeFromCombat(player));
      player.fleeFromCombat();

      player.sayL10n(l10n, 'FLEE_SUCCEED');
      const duration = player.getAttribute('level') * 1000;
      util.log(player.getName() + " fled successfully.");
      player.addEffect('cowardice', {
        type: 'debuff',
        penalty: 1,
        duration:
      });
    } else {
      player.sayL10n(l10n, "FLEE_FAIL");
    }
  };
};
