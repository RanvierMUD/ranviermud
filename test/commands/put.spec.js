'use strict';

const expect = require('chai').expect;

const CommandInjector = require('./command-mock-utils').CommandInjector;
const getGlobals      = require('./command-mock-utils').getGlobals;

const Room   = require('../../src/rooms').Room;
const Player = require('../../src/player').Player;

const putCmd = require('../../commands/put').command;

const globals = getGlobals();

const put = CommandInjector(putCmd, globals);

const [ rooms, items, players, npcs, Commands ] = globals;
const location = 22;
const socket = { write: function() {} };
const player = new Player(socket);
player.setLocation(location);

const room = new Room({ location });
rooms.addRoom(room);

describe('successfully putting something in a container', () => {

  it('should let a player put an item from their inventory into a container in the same room', () => {

  });

  it('should let a player take an item from the room and put it in a container in their inventory', () => {

  });

});
