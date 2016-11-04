'use strict';

const expect = require('chai').expect;
const sinon  = require('sinon');

const CommandInjector = require('./command-mock-utils').CommandInjector;
const getGlobals      = require('./command-mock-utils').getGlobals;
const addItem         = require('./command-mock-utils').addItem;
const getCallCounter  = require('./command-mock-utils').getCallCounter;

const Player = require('../../src/player').Player;
const Npc    = require('../../src/npcs').Npc;
const Room   = require('../../src/rooms').Room;
const Type   = require('../../src/type').Type;
const Item   = require('../../src/items').Item;
Type.config(Player, Npc, Item, {});

const socket = {
  write: sinon.stub()
}

const player = new Player(socket);

const lookCmd = require('../../commands/look').command;
const globals = getGlobals();
const look = CommandInjector(lookCmd, globals);

const [ rooms, items, players, npcs, Commands ] = globals;
players.addPlayer(player);

// Make a room to put the player in.

// Put an npc an an item and another player in it?
describe('Looking at a room', () => {
  it('should describe the room', () => {

  });
});

describe('Looking at an npc in a room', () => {

});

describe('Looking at an item in a room', () => {

});

describe('Looking at another player', () => {

});

describe('Looking at oneself', () => {

});

describe('Looking at adjacent rooms', () => {

});
