'use strict';
const CommandUtil = require('../../../src/command_util.js')
  .CommandUtil;
const chooseRandomExit = require('../../../src/pathfinding.js').chooseRandomExit;

exports.listeners = {
  playerEnter: chooseRandomExit
};
