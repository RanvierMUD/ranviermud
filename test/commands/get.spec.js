'use strict';

const expect = require('chai').expect;

const CommandInjector = require('./command-mock-utils').CommandInjector;
const getGlobals      = require('./command-mock-utils').getGlobals;

const Player = require('../../src/player').Player;
const player = new Player();

const getCmd = require('../../commands/get').command;
const globals = getGlobals();
const get = CommantInjector(getCmd, globals);

describe('successfully getting something from a room', () => {

});
