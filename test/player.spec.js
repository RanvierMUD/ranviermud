const Player = require('../src/player.js').Player;
const expect = require('chai').expect;
const Mocks  = require('./mocks/mocks');


describe('New player', () => {

    it('Should be of the Player class', () => {
      const testPlayer = new Player();
      expect(testPlayer instanceof Player).to.be.true;
    });

    it('Should have default attributes', () => {
      const testPlayer = new Player();

      const expected   = Mocks.defaultAttributes;
      const actual     = testPlayer.getAttributes();

      expect(actual).to.eql(expected);
    });

});
