'use strict';
const Doors = require('../src/doors').Doors;

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => Doors.useKey('lock', args, player, players, rooms);
