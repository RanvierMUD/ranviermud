'use strict';
const CommandUtil = require('../../../src/command_util').CommandUtil;
const Random = require('../../../src/random').Random;
const move = require('../../../src/commands').Commands.move;
exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {

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

      player.say(`<red>You manage to escape in one piece!</red>`);
      util.log(player.getName() + " fled successfully.");
    } else {
      player.warn('You are cornered and unable to escape!');
    }
  };
};
