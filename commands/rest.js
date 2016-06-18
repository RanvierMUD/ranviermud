'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const self = player.getName();

    if (player.isInCombat()) {
      return player.say("You can't do that while fighting.");
    }
    if (player.getEffects('recuperating')) {
      return player.say('You are already recuperating.');
    }

    util.log(self + ' is resting.');
    player.write('<blue>You rest and regain health.</blue>\n');
    player.emit('regen');
  };
};
