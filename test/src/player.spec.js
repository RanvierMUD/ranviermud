const Player = require('../../src/player.js').Player;
const expect = require('chai').expect;
const Mocks  = require('../mocks/mocks');


describe('New player', () => {

    const testPlayer = new Player();

    it('Should be of the Player class', () => {
      const testPlayer = new Player();
      expect(testPlayer instanceof Player).to.be.true;
    });

    it('Should have default attributes', () => {
      const expected   = Mocks.defaultAttributes;
      const actual     = testPlayer.getAttributes();

      expect(actual).to.eql(expected);
    });

    it('Should get a prompt string.', () => {
      expect(testPlayer.getPrompt()).to.be.a('String');
      expect(testPlayer.getCombatPrompt()).to.be.a('String');
    });

    it('Should be able to set and get location ', () => {
      testPlayer.setLocation(5);
      expect(testPlayer.getLocation() === 5).to.be.true;
    });

});
