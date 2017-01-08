'use strict';
const Doors = require('../../../src/doors').Doors;

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => Doors.useKeyToUnlock(args, player, players, rooms, items);
