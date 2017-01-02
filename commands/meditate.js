'use strict';
const l10nFile = __dirname + '/../l10n/commands/emote.yml';
const l10n = require('../src/l10n')(l10nFile);
const CommandUtil = require('../src/command_util').CommandUtil;
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

    const events = {
      action: () => {
        player.removeEffect("resting sanity");
        player.removeEffect("resting energy");
        player.warn("You end your meditation session.");
      }
    };

    player.addEffect('resting sanity', {
      type: 'regen',
      bonus: player.getSkills('concentration') || 1,
      attribute: 'sanity',
      events
    });

    player.addEffect('resting energy', {
      type: 'regen',
      bonus: player.getSkills('athletics') || 1,
      attribute: 'energy',
    });

    player.write('<blue>You meditate and alleviate stress.</blue>\n');

  };
};
