'use strict';
const CommandUtil = require('../../../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const self = player.getName();

    if (player.isInCombat()) {
      return player.say("You can't do that while fighting.");
    }
    if (player.getEffects('resting energy')) {
      return player.say('You are already recuperating.');
    }

    util.log(self + ' is resting.');

    const events = {
      action: () => {
        player.removeEffect("resting health");
        player.removeEffect("resting energy");
        player.warn("You get back on your feet again.");
      }
    };

    player.addEffect('resting health', {
      type: 'regen',
      bonus: player.getSkills('recovery') || 1,
      events
    });

    player.addEffect('resting energy', {
      type: 'regen',
      bonus: player.getSkills('athletics') || 1,
      attribute: 'energy',
    });

    player.write('<blue>You rest and regain health.</blue>\n');

  };
};
