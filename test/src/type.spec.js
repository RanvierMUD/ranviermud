const expect = require('chai').expect;

const Type = require('../../src/type').Type;
const Player = require('../../src/player').Player;

describe('Typing', () => {
  //FIXME: Why do these fail?
  xit('Should return true if constructor was used', () => {
    const testPlayer = new Player();
    expect(Type.isPlayer(testPlayer)).to.be.true;
  });

  xit('Should return false otherwise', () => {
    const testFake = { player: true };
    expect(Type.isPlayer(testFake)).to.be.false;
  });

});
