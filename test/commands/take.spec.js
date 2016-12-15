'use strict';

const expect = require('chai').expect;

const CommandInjector = require('./command-mock-utils').CommandInjector;
const getGlobals      = require('./command-mock-utils').getGlobals;

const takeCmd = require('../../commands/take').command;

const globals = getGlobals();

const take = CommandInjector(takeCmd, globals);

describe('successfully taking something from a container', () => {

});
