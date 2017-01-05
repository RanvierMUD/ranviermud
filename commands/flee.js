'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const Random = require('../src/random').Random;
const move = require('../src/commands').Commands.move;
const l10nFile = __dirname + '/../l10n/commands/flee.yml';
const util = require('util');
const l10n = require('../src/l10n')(l10nFile);

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

      const duration = player.getAttribute('level') * 1000;
      player.addEffect('cowardice', {
        type: 'debuff',
        name: 'Cowardice',
        description: 'Recovering from fleeing in fear',
        aura: 'cowardly',
        penalty: 1,
        duration
      });


      const cumulativeOpponentLevel = opponents.reduce((sum, opp) => sum += opp.getAttribute('level'), 0);
      const level = player.getAttribute('level');

      if (cumulativeOpponentLevel > level + 2) {
        const expGain = (cumulativeOpponentLevel - level) * 10;
        player.emit('experience', expGain, 'surviving to fight again another day');
      }

    } else {
      player.warn('You are cornered and unable to escape!');
    }
  };
};
