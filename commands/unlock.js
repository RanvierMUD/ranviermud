'use strict';
const Doors = require('../src/doors').Doors;

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => Doors.useKey('unlock', args, player, players, rooms);
