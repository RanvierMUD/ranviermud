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

const getCmd = require('../../commands/get').command;
const globals = getGlobals();
const get = CommandInjector(getCmd, globals);

const [ rooms, items, players, npcs, Commands ] = globals;
players.addPlayer(player);

sinon.spy(player, 'warn');
sinon.spy(items, 'get');

describe('successfully getting something from a room', () => {

});

describe.only('failing to get stuff from a room', () => {
  const location = 2;
  const newRoom = new Room({ location });
  rooms.addRoom(newRoom);
  player.setLocation(location);

  it('should not let you get things during combat', () => {
    player.setInCombat({});

    get('thing', player);

    const call = player.warn.getCall(0);
    expect(call.args[0] === "You cannot do that while you're fighting.").to.be.true;
    expect(items.get.called).to.be.false;

    player.fleeFromCombat();
  });

  it('should not let you get an item that is not in your room', () => {

    get('potatos', player);

    const call = player.warn.getCall(1);
    expect(call.args[0] === 'The potatos could not be found here.').to.be.true;
  });

  it('should not let you get an item if it is infinitely heavy...', () => {
    const attributes = { weight: Infinity };
    const keywords = ['burrito'];
    const uuid = 'wat';
    const heavyItemConfig = { name: 'burrito', keywords, attributes, location, uuid };
    const heavyItem = new Item(heavyItemConfig);
    items.addItem(heavyItem); //TODO: Make this consistent. Room shouldn't need the uuid passed, should just get it.
    newRoom.addItem(heavyItem.getUuid());

    get('burrito', player);

    const call = player.warn.getCall(2);
    expect(call.args[0] === "You are not able to carry that.").to.be.true;
  });

  it('should not let you get an item if it is too heavy...', () => {
    const attributes = { weight: 200 };
    const keywords = ['taco'];
    const uuid = 'hokay';
    const heavyItemConfig = { name: 'taco', keywords, attributes, location, uuid };
    const heavyItem = new Item(heavyItemConfig);
    items.addItem(heavyItem); //TODO: Make this consistent. Room shouldn't need the uuid passed, should just get it.
    newRoom.addItem(heavyItem.getUuid());

    get('taco', player);

    const call = player.warn.getCall(3);
    console.log(call.args);
    expect(call.args[0] === "You are not able to carry that.").to.be.true;
  });
});
