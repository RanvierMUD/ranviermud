const expect = require('chai').expect;
const sinon  = require('sinon');

const Broadcast = require('../../src/broadcast').Broadcast;
const Player = require('../../src/player').Player;
const Npc = require('../../src/npcs').Npc;

const Type   = require('../../src/type.js').Type;
Type.config(Player, Npc);

describe('broadcasting to an area', () => {

  it('should return a broadcaster function', () => {
    const fn = Broadcast.toArea({}, {}, {});
    expect(typeof fn === 'function').to.be.true;
  });

  it('should say a thing to all players in area except originator', () => {
    const fakePlayer = {
      say: sinon.spy(),
      prompt: sinon.spy(),
      getLocation: () => 2
    };
    const fakeOtherPlayer = {
      say: sinon.spy(),
      prompt: sinon.spy(),
      getLocation: () => 4
    };
    const fakePlayers = {
      eachExcept: (player, cb) => cb(fakeOtherPlayer)
    };

    const fakeRoom = {
      getArea: () => 'potato land'
    };

    const fakeRooms = {
      getAt: vnum => Object.assign({ vnum }, fakeRoom)
    };

    const toArea = Broadcast.toArea(fakePlayer, fakePlayers, fakeRooms);
    toArea('test message');

    expect(fakeOtherPlayer.say.calledWith('test message')).to.be.true

  });

});


describe('broadcasting to a single room', () => {

  const fakePlayer = {
    say: sinon.spy(),
    prompt: sinon.spy(),
    getLocation: () => 2
  };

  const firstParty       = Object.assign(new Player(), fakePlayer);
  const secondParty      = Object.assign(new Player(), fakePlayer);
  const thirdPartyPlayer = Object.assign(new Player(), fakePlayer);
  const thirdParty = {
    eachIf: (condition, cb) => {
      if (condition(thirdPartyPlayer)) { cb(thirdPartyPlayer); }
    }
  };

  const fakeRoom = {
    getLocation: () => 2
  };

  it('should return a broadcaster function', () => {
    const fn = Broadcast.toRoom({}, {}, {}, {});
    expect(typeof fn === 'function').to.be.true;
  });

  it('should say things to all parties involved', () => {
    const toRoom = Broadcast.toRoom(fakeRoom, firstParty, secondParty, thirdParty);
    const messages = {
      firstPartyMessage:  '1st test',
      secondPartyMessage: '2nd test',
      thirdPartyMessage:  '3rd test'
    };
    toRoom(messages);

    expect(firstParty.say.calledWith('1st test')).to.be.true;
    expect(secondParty.say.calledWith('2nd test')).to.be.true;
    expect(thirdPartyPlayer.say.calledWith('3rd test')).to.be.true;
  });

});
