'use strict';
var CommandUtil = require('../../../src/command_util.js')
  .CommandUtil;
var chooseRandomExit = require('../../../src/command_util.js').chooseRandomExit;

exports.listeners = {
  tick: chooseRandomExit
};
