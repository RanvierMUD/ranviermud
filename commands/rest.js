'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const self = player.getName();
    util.log(self + ' is resting.');
    player.write('You rest and regain health.\n');
    player.emit('regen');
  };
};
