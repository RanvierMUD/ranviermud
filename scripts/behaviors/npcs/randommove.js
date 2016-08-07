'use strict';
const Random = require('../../../src/random.js').Random;
const chooseRandomExit = require('../../../src/pathfinding.js').chooseRandomExit;

const failureRoll = 10;

exports.listeners = {
  tick: chooseRandomExit(failureRoll)
};
