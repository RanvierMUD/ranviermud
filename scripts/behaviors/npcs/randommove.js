'use strict';
const Random = require('../../../src/random.js').Random;
const chooseRandomExit = require('../../../src/pathfinding.js').chooseRandomExit;

const failureRoll = 5;

exports.listeners = {
  tick: chooseRandomExit(failureRoll)
};
