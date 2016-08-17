'use strict';
const CommandUtil = require('../../src/command_util')
  .CommandUtil;
const Random = require('../../src/random').Random;
const examiner = require('../../src/examine').examine;
const Broadcast = require('../../src/broadcast').Broadcast;
const util = require('util');

exports.listeners = {
  playerEnter: l10n => {
    return function splat(player, players, rooms) {
      const dead = 0;
      player.say('You splatter against the bottom of the well.');
      player.setAttribute('health', 0);
      // player.kill();
      const toArea = Broadcast.toArea(player, players, rooms)
      toArea('You hear a series of sharp crackling sounds.');
    }
  }
};
