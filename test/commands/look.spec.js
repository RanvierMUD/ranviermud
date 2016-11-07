'use strict';

const expect = require('chai').expect;
const sinon  = require('sinon');

const CommandInjector = require('./command-mock-utils').CommandInjector;
const getGlobals      = require('./command-mock-utils').getGlobals;
const addItem         = require('./command-mock-utils').addItem;
const addNpc          = require('./command-mock-utils').addNpc;
const getCallCounter  = require('./command-mock-utils').getCallCounter;

const Time   = require('../../src/time').Time;
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

sinon.spy(player, 'say');
sinon.spy(player, 'write');
sinon.stub(Time, 'isDay');

const getPlayerSayCall = getCallCounter(player.say);

const location = 4;
const description = 'room desc';
const short_desc = 'room shortdesc';
const dark_desc = 'room darkdesc';
const area = 'The Dungeon';
const title = 'Treasure Chamber';
const room = new Room({ area, title, location, short_desc, dark_desc, description });

rooms.addRoom(room);
player.setLocation(location);
player.setPreference('roomdescs', 'default');

const shield = addItem({
  items, room, location,
  short_description: 'a shield',
  room_description: 'a sturdy shield',
  keywords: ['shield'],
  uuid: 'shield'
});

const goblin = addNpc({
  room, location, npcs,
  attributes: { level: 1 },
  short_description: 'a goblin',
  room_description: 'a menacing goblin',
  keywords: ['goblin'],
  uuid: 'gobbo'
});

describe('Look command', () => {

  describe('Looking at a room', () => {

    describe('looking at the room during the day', () => {
      Time.isDay.returns(true);

      look('', player);

      // check for all player.say calls...
      it('should give the area and room title', () => {
        const titleCall = getPlayerSayCall();
        const expectedTitle = area + ': ' + title;
        expect(titleCall.args[0] === expectedTitle).to.be.true;
      });

      it('should show long description since player has not explored the room yet and their preference is default', () => {
        const descCall = getPlayerSayCall();
        expect(descCall.args[0] === description).to.be.true;
      });

      it('should do a newline after the room desc', () => {
        const newLineCall = getPlayerSayCall();
        expect(newLineCall.args[0] === '').to.be.true;
      });

      it('should show the item on the ground', () => {
        const itemCall = getPlayerSayCall();
        const expectedItemRoomDesc = '<magenta>a sturdy shield</magenta>';
        expect(itemCall.args[0] === expectedItemRoomDesc).to.be.true;
      });

      it('should show any NPCs, color coded by threat level (easy)', () => {
        const npcCall = getPlayerSayCall();
        const expectedNpcRoomDesc = '<green>a menacing goblin</green>';
        expect(npcCall.args[0] === expectedNpcRoomDesc).to.be.true;
      });

      it('should show a label for any of the room\'s exits', () => {
        const exitsCall = player.write.getCall(1);
        const expectedItemsLabel = '<yellow><bold>Obvious exits: </yellow></bold>';
        expect(exitsCall.args[0] === expectedItemsLabel).to.be.true;
      });

      it('should close the exits list with a bracket', () => {
        const exitCloseCall = getPlayerSayCall();
        expect(exitCloseCall.args[0] === ']').to.be.true;
      });

    });

    describe('looking at a room while it is dark', () => {
      Time.isDay.returns(false);

      look('', player);

      // check for all player.say calls...
      it('should give the area and room title', () => {
        const titleCall = getPlayerSayCall();
        const expectedTitle = area + ': ' + title;
        expect(titleCall.args[0] === expectedTitle).to.be.true;
      });

      it('should show dark description', () => {
        const descCall = getPlayerSayCall();
        expect(descCall.args[0] === dark_desc).to.be.true;
      });

      it('should do a newline after the room desc', () => {
        const newLineCall = getPlayerSayCall();
        expect(newLineCall.args[0] === '').to.be.true;
      });

      it('should show the item on the ground', () => {
        const itemCall = getPlayerSayCall();
        const expectedItemRoomDesc = '<magenta>a sturdy shield</magenta>';
        expect(itemCall.args[0] === expectedItemRoomDesc).to.be.true;
      });

      it('should show any NPCs, color coded by threat level (easy)', () => {
        const npcCall = getPlayerSayCall();
        const expectedNpcRoomDesc = '<green>a menacing goblin</green>';
        expect(npcCall.args[0] === expectedNpcRoomDesc).to.be.true;
      });

      it('should show a label for any of the room\'s exits', () => {
        const exitsCall = player.write.getCall(1);
        const expectedItemsLabel = '<yellow><bold>Obvious exits: </yellow></bold>';
        expect(exitsCall.args[0] === expectedItemsLabel).to.be.true;
      });

      it('should close the exits list with a bracket', () => {
        const exitCloseCall = getPlayerSayCall();
        expect(exitCloseCall.args[0] === ']').to.be.true;
      });

    });

    describe('looking at a room with after having explored it', () => {
      Time.isDay.returns(true);

      const hasExplored = true;
      look('', player, hasExplored);

      // check for all player.say calls...
      it('should give the area and room title', () => {
        const titleCall = getPlayerSayCall();
        const expectedTitle = area + ': ' + title;
        expect(titleCall.args[0] === expectedTitle).to.be.true;
      });

      it('should show short description by default after exploring', () => {
        const descCall = getPlayerSayCall();
        expect(descCall.args[0] === short_desc).to.be.true;
      });

      it('should do a newline after the room desc', () => {
        const newLineCall = getPlayerSayCall();
        expect(newLineCall.args[0] === '').to.be.true;
      });

      it('should show the item on the ground', () => {
        const itemCall = getPlayerSayCall();
        const expectedItemRoomDesc = '<magenta>a sturdy shield</magenta>';
        expect(itemCall.args[0] === expectedItemRoomDesc).to.be.true;
      });

      it('should show any NPCs, color coded by threat level (easy)', () => {
        const npcCall = getPlayerSayCall();
        const expectedNpcRoomDesc = '<green>a menacing goblin</green>';
        expect(npcCall.args[0] === expectedNpcRoomDesc).to.be.true;
      });

      it('should show a label for any of the room\'s exits', () => {
        const exitsCall = player.write.getCall(1);
        const expectedItemsLabel = '<yellow><bold>Obvious exits: </yellow></bold>';
        expect(exitsCall.args[0] === expectedItemsLabel).to.be.true;
      });

      it('should close the exits list with a bracket', () => {
        const exitCloseCall = getPlayerSayCall();
        expect(exitCloseCall.args[0] === ']').to.be.true;
      });

    });

    Time.isDay.restore();
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

});
