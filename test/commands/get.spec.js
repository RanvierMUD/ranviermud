'use strict';

const expect = require('chai').expect;
const sinon  = require('sinon');

const CommandInjector = require('./command-mock-utils').CommandInjector;
const getGlobals      = require('./command-mock-utils').getGlobals;

const Player = require('../../src/player').Player;
const Npc = require('../../src/npcs').Npc;
const Type = require('../../src/type').Type;
Type.config(Player, Npc, {}, {});

const socket = {
  write: sinon.stub()
}
const player = new Player(socket);

const getCmd = require('../../commands/get').command;
const globals = getGlobals();
const get = CommandInjector(getCmd, globals);

const [ rooms, items, players, npcs, Commands ] = globals;
players.addPlayer(player);


describe('successfully getting something from a room', () => {

});

describe('failing to get stuff from a room', () => {
  it('should not let you get things during combat', () => {
    player.setInCombat({});
    sinon.spy(player, 'warn');
    sinon.spy(items, 'get');
    get('thing', player);
    const call = player.warn.getCall(0);
    expect(call.args[0] === "You cannot do that while you're fighting.").to.be.true;
    expect(items.get.called).to.be.false;
  });
});
