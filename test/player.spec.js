const Player = require('../src/player.js').Player;
const expect = require('chai').expect;


describe('New player', () => {
    it('Should be of the Player class', () => {
      const testPlayer = new Player();
      expect(testPlayer instanceof Player).to.be.true;
    });
});
