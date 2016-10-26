'use strict';

const expect = require('chai').expect;

const CommandInjector = require('./command-mock-utils').CommandInjector;
const getGlobals      = require('./command-mock-utils').getGlobals;

const putCmd = require('../../commands/put').command;

const globals = getGlobals();

const put = CommandInjector(putCmd, globals);

describe('successfully putting something in a container', () => {

});
