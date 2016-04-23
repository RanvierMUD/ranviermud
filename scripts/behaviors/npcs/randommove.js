'use strict';
const CommandUtil = require('../../../src/command_util.js')
  .CommandUtil;
const chooseRandomExit = require('../../../src/pathfinding.js').chooseRandomExit;

const successRoll = 18;

exports.listeners = {
  tick: chooseRandomExit(successRoll),
};
