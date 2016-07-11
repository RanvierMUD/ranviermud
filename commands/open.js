'use strict';
const CommandUtil = require('../src/command_util')
  .CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/flee.yml';
const util = require('util');
const l10n = require('../src/l10n')(l10nFile);

const Doors = require('../src/doors').Doors;


exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) =>
    Doors.openOrClose('open', args, player, players, rooms);
