'use strict';

const expect = require('chai').expect;
const sinon  = require('sinon');

const CommandInjector = require('./command-mock-utils').CommandInjector;
const getGlobals      = require('./command-mock-utils').getGlobals;
const addItem         = require('./command-mock-utils').addItem;
const getCallCounter  = require('./command-mock-utils').getCallCounter;

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

const getWarnCall = getCallCounter(player.warn);

describe('failing to drop items', () => {

  it('should not let you drop an item you do not have', () => {

    drop('potato', player);
    const call = getWarnCall()
    expect(call.args[0] === 'You cannot drop an item you do not have.').to.be.true;
  });

  it('should not let you drop something you are wearing', () => {
    const wearLocation = 'body';
    const keywords     = ['armor'];
    const uuid         = 'armor';
    const short_description = 'armor';
    const armor = addItem({ items, player, equipped: true, short_description, keywords, uuid });

    drop('armor', player);

    const call = getWarnCall();
    expect(call.args[0] === 'You are wearing armor right now, and cannot drop it.').to.be.true;
  });

});

describe('successfully dropping items', () => {

  const location = 7;
  const room = new Room({ location });
  rooms.addRoom(room);
  player.setLocation(location);

  it('should let you drop one at a time if you have it in inventory...', () => {
    const uuid = "potato";
    const keywords = ["potato"];
    const potato = addItem({ uuid, keywords, items, player });

    drop('potato', player);

    const inventory = player.getInventory();
    expect(inventory.includes(potato)).to.be.false;
    expect(room.getItems().includes(uuid)).to.be.true;
  });

  it('should let you drop a ton of items at once', () => {
    const ham = addItem({
      uuid: 'ham',
      keywords: ['ham', 'sandwich'],
      items,
      player
    });
    const sunglasses = addItem({
      uuid: 'sg',
      keywords: ['sun'],
      items,
      player
    });
    const vest = addItem({
      uuid: 'vest',
      keywords: ['vest'],
      items,
      player
    });

    drop('all', player);

    const roomItems = room.getItems();
    const inventory = player.getInventory();
    [ ham, sunglasses, vest ].forEach( item => {
      expect(inventory.includes(item)).to.be.false;
      expect(roomItems.includes(item.getUuid())).to.be.true;
    });

  });

});
