'use strict';
const util = require('util');

const CommandUtil = require('../src/command_util').CommandUtil;
const Doors = require('../src/doors').Doors;


exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => Doors.openOrClose('open', args, player, players, rooms);
