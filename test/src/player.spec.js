const Player = require('../../src/player.js').Player;
const expect = require('chai').expect;
const Mocks  = require('../mocks/mocks');


describe('New player', () => {

    const testPlayer = new Player();

    beforeEach(() => {});

    afterEach(() => {});


    it('Should be of the Player class', () => {
      const testPlayer = new Player();
      expect(testPlayer instanceof Player).to.be.true;
    });

    it('Should get a prompt string.', () => {
      expect(testPlayer.getPrompt()).to.be.a('String');
      expect(testPlayer.getCombatPrompt()).to.be.a('String');
    });



    describe('Attributes', () => {

      it('Should have default attributes', () => {
        const expected   = Mocks.defaultAttributes;
        const actual     = testPlayer.getAttributes();

        expect(actual).to.eql(expected);
      });

      it('Should be able to set and get attributes', () => {
        const current = testPlayer.getAttribute('health');
        const damaged = current - 10;
        testPlayer.setAttribute('health', damaged);
        expect(testPlayer.getAttribute('health') === damaged).to.be.true;
      });

    });



    describe('Player Location', () => {

      it('Should be able to set and get location ', () => {
        testPlayer.setLocation(5);
        expect(testPlayer.getLocation() === 5).to.be.true;
      });

      it('Should be able to get player room from rooms obj', () => {
        const room = testPlayer.getRoom(Mocks.Rooms);
        expect(room).to.equal("Correct");
      });

      it('Returns null if rooms object is invalid', () => {
        const room = testPlayer.getRoom(undefined);
        expect(room).to.not.be.ok;
      });

    });


    describe('Preferences', () => {

      it('Should have default preferences', () => {
        const preferences = ['stance' , 'wimpy', 'target', 'roomdescs'];
        const actual = {};
        preferences.forEach(pref => {
          actual[pref] = testPlayer.getPreference(pref);
        });

        expect(actual).to.eql(Mocks.defaultPreferences);
      });

      it('Should be able to set and get preferences', () => {
        testPlayer.setPreference('wimpy', 5);
        const actual = testPlayer.getPreference('wimpy');
        expect(actual).to.equal(5);
      });

    });
    
});
