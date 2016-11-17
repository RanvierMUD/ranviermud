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

    describe('looking at a room after having explored it with default preferences', () => {
      Time.isDay.returns(true);
      goblin.setAttribute('level', -4);

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

      it('should show any NPCs, color coded by threat level (very easy)', () => {
        const npcCall = getPlayerSayCall();
        const expectedNpcRoomDesc = '<cyan>a menacing goblin</cyan>';
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

    describe('Looking at a room you have not explored with shortdesc preference', () => {

      Time.isDay.returns(true);
      player.setPreference('roomdescs', 'short');
      goblin.setAttribute('level', 30);

      const hasExplored = false;
      look('', player, hasExplored);

      // check for all player.say calls...
      it('should give the area and room title', () => {
        const titleCall = getPlayerSayCall();
        const expectedTitle = area + ': ' + title;
        expect(titleCall.args[0] === expectedTitle).to.be.true;
      });

      it('should show short description due to preferences', () => {
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

      it('should show any NPCs, color coded by threat level (hard)', () => {
        const npcCall = getPlayerSayCall();
        const expectedNpcRoomDesc = '<red>a menacing goblin</red>';
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

    describe('Looking at a room you have explored with verbose desc preference', () => {

      Time.isDay.returns(true);
      player.setPreference('roomdescs', 'verbose');
      goblin.setAttribute('level', 2);
      const oldHasMet = player.hasMet;
      player.hasMet = () => true;
      goblin.name = 'Boblin';

      const hasExplored = true;
      look('', player, hasExplored);

      // check for all player.say calls...
      it('should give the area and room title', () => {
        const titleCall = getPlayerSayCall();
        const expectedTitle = area + ': ' + title;
        expect(titleCall.args[0] === expectedTitle).to.be.true;
      });

      it('should show verbose description due to preferences', () => {
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

      it('should show any NPCs by name if they have been met, color coded by threat level (medium)', () => {
        const npcCall = getPlayerSayCall();
        const expectedNpcRoomDesc = '<yellow>Boblin</yellow>';
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

      player.hasMet = oldHasMet;
    });

    Time.isDay.restore();
  });

  describe('Looking at an npc in a room', () => {
    look('goblin', player);

    it('should show goblin description', () => {
      const npcDescCall = getPlayerSayCall();
      expect(npcDescCall.args[0] === goblin.getDescription()).to.be.true;
    });

  });

  describe('Looking at an item in a room', () => {
    look('shield', player);

    it('should show shield description', () => {
      const itemDescCall = getPlayerSayCall();
      expect(itemDescCall.args[0] === shield.getDescription()).to.be.true;
    });
  });

  describe('Looking at an item in your own inventory', () => {
    player.addItem(shield);
    look('shield', player);

    it('should show shield description', () => {
      const itemDescCall = getPlayerSayCall();
      expect(itemDescCall.args[0] === shield.getDescription()).to.be.true;
    });
  });

  const bucket = addItem({
    items, room, location,
    attributes: {
      maxWeightCapacity: 10,
      maxSizeCapacity: 10,
    },
    uuid: 'bucket',
    keywords: ['bucket'],
    short_description: 'bucket',
    room_description: 'a tin bucket',
    description: 'bucket of stuff'
  });

  describe('Looking at a container in the room', () => {

    describe('Looking at an empty container', () => {
      look('bucket', player);

      it('should describe the container', () => {
        const containerDescCall = getPlayerSayCall();
        expect(containerDescCall.args[0] === "bucket of stuff");
      });

      it('should label the list of contents', () => {
        const contentsLabelCall = getPlayerSayCall();
        expect(contentsLabelCall.args[0] === "<bold>CONTENTS: </bold>");
      });

      it('should say it is empty', () => {
        const emptyCall = getPlayerSayCall();
        expect(emptyCall.args[0] === '<cyan>empty</cyan>');
      });

    });

    describe('Looking at a container with a thing in it', () => {

      const potato = addItem({
        items,
        keywords: ['potato'],
        uuid: 'potato',
        short_description: 'a potato',
        room_description: 'a slightly moldy potato'
      });

      bucket.addItem(potato);

      look('bucket', player);

      it('should describe the container', () => {
        const containerDescCall = getPlayerSayCall();
        expect(containerDescCall.args[0] === "bucket of stuff");
      });

      it('should label the list of contents', () => {
        const contentsLabelCall = getPlayerSayCall();
        expect(contentsLabelCall.args[0] === "<bold>CONTENTS: </bold>");
      });

      it('should say it has a potato', () => {
        const potatoCall = getPlayerSayCall();
        expect(potatoCall.args[0] === '<cyan>- a potato</cyan>');
      });

    });
  });

  describe('Looking at oneself', () => {
    look('me', player);

    it('should describe oneself', () => {
      const playerDescCall = getPlayerSayCall();
      expect(playerDescCall.args[0] === player.getDescription()).to.be.true;
    });

    it('should tell you if you are naked', () => {
      const playerEquipCall = getPlayerSayCall();
      expect(playerEquipCall.args[0] === 'You are naked!').to.be.true;
    });

  });

  //TODO: Fix?
  xdescribe('Looking at adjacent rooms', () => {
    const fakeExit = {
      location:  1,
      direction: 'tavern'
    };

    const adjacent = new Room({ area, title, location: 1, short_desc, dark_desc,
      description: 'a frickin tavern' });

    rooms.addRoom(adjacent);
    room.exits.push(fakeExit);
    look('tavern', player);

    it('should describe room if you look at it.', () => {
      const playerLookAdjacentCall = getPlayerSayCall();
      console.log(playerLookAdjacentCall.args[0]);
      expect(playerLookAdjacentCall.args[0] === adjacent.getDescription());
    });

    room.exits[0].door = { open: false };

    it('should tell you if there is a door in the way.', () => {
      sinon.spy(player, 'warn');
      const playerLookDoorCall = player.warn.getCall(0);
      console.log(playerLookDoorCall.args[0]);
      expect(playerLookDoorCall.args[0] === '<yellow>There is a door in the way...</yellow>');
    });

  });

});
