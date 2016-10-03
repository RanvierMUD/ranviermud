const expect = require('chai').expect;
const sinon  = require('sinon');

const Broadcast = require('../../src/broadcast').Broadcast;

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

  })
});
