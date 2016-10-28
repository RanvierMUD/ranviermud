'use strict';

const expect = require('chai').expect;
const sinon  = require('sinon');

const CommandInjector = require('./command-mock-utils').CommandInjector;
const getGlobals      = require('./command-mock-utils').getGlobals;

const Player = require('../../src/player').Player;
const Npc = require('../../src/npcs').Npc;
const Room = require('../../src/rooms').Room;
const Type = require('../../src/type').Type;
const Item = require('../../src/items').Item;
Type.config(Player, Npc, {}, {});

const socket = {
  write: sinon.stub()
}

const player = new Player(socket);

const dropCmd = require('../../commands/drop').command;
const globals = getGlobals();
const drop = CommandInjector(dropCmd, globals);

const [ rooms, items, players, npcs, Commands ] = globals;

sinon.spy(player, 'warn');

describe.only('failing to drop items', () => {

  it('should not let you drop an item you do not have', () => {

    drop('potato', player);
    const call = player.warn.getCall(0);
    expect(call.args[0] === 'You cannot drop an item you do not have.').to.be.true;
  });

  it('should not let you drop something you are wearing', () => {
    const wearLocation = 'body';
    const keywords = ['armor'];
    const uuid = 'armor';
    const short_description = 'armor';
    const armor = new Item({ uuid, wearLocation, keywords, short_description });
    items.addItem(armor);
    player.addItem(armor);
    player.equip('body', armor);

    drop('armor', player);

    const call = player.warn.getCall(1);
    expect(call.args[0] === 'You are wearing armor right now, and cannot drop it.').to.be.true;
  });

});

describe('successfully dropping items', () => {

  it('should let you drop one at a time if you have it in inventory...', () => {

  });

});
