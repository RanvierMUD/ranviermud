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

const getCmd = require('../../commands/get').command;
const globals = getGlobals();
const get = CommandInjector(getCmd, globals);

const [ rooms, items, players, npcs, Commands ] = globals;
players.addPlayer(player);

sinon.spy(player, 'warn');
sinon.spy(items, 'get');
const getWarnCall = getCallCounter(player.warn);

const location = 2;
const room = new Room({ location });
rooms.addRoom(room);
player.setLocation(location);

describe('failing to get stuff from a room', () => {

  it('should not let you get things during combat', () => {
    player.setInCombat({});

    get('thing', player);

    const call = getWarnCall();
    expect(call.args[0] === "You cannot do that while you're fighting.").to.be.true;
    expect(items.get.called).to.be.false;

    player.fleeFromCombat();
  });

  it('should not let you get an item that is not in your room', () => {

    get('potatos', player);

    const call = getWarnCall();
    expect(items.get.called).to.be.false;
    expect(call.args[0] === 'The potatos could not be found here.').to.be.true;
  });

  it('should not let you get an item if it is infinitely heavy...', () => {
    const attributes = { weight: Infinity };
    const keywords = ['burrito'];
    const uuid = 'wat';
    const heavyItemConfig = { name: 'burrito', keywords, attributes, location, uuid };
    const heavyItem = addItem(Object.assign({ items, room }, heavyItemConfig));

    get('burrito', player);

    const call = getWarnCall();
    expect(call.args[0] === "You are not able to carry that.").to.be.true;
  });

  it('should not let you get an item if it is too heavy...', () => {
    const attributes = { weight: 200 };
    const keywords = ['taco'];
    const uuid = 'hokay';
    const heavyItemConfig = { name: 'taco', keywords, attributes, location, uuid };
    const heavyItem = addItem(Object.assign({ items, room }, heavyItemConfig));

    get('taco', player);

    const call = getWarnCall();
    expect(call.args[0] === "You are not able to carry that.").to.be.true;
  });
});

describe('successfully getting something from a room', () => {

  it('should be able to get a single item', () => {
    const keywords = ['burger'];
    const uuid = 'ham';
    const burgerConfig = { name: 'burger', keywords, uuid, location }
    const burger = addItem(Object.assign({ items, room }, burgerConfig));

    get('burger', player);

    const inventory = player.getInventory();
    expect(inventory.includes(burger)).to.be.true;
  });

  it('should be able to try to get all items', () => {
    const createItem = (keywords, uuid) => {
      const location = 2;
      return addItem({ keywords, uuid, location, items, room });
    };

    const bulkItems = [
      createItem(['sandwich'], 22),
      createItem(['what'], 9999),
      createItem(['purdy necklace'], 374)
    ];

    get('all', player);

    const inventory = player.getInventory();
    expect(bulkItems.every( item => inventory.includes(item) )).to.be.true;

  });

});
