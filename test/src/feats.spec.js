const expect = require('chai').expect;
const Feats = require('../../src/feats').Feats
const meetsPrerequisites = require('../../src/feats').meetsPrerequisites;

const fakeAttributes = { "stamina": 2, "willpower": 1, "quickness": 1, "cleverness": 1, "level": 2 };
const fakePlayer = {
  getAttributes: attr => fakeAttributes[attr] || fakeAttributes,
  getName:  () => 'Lady Barcelona',
  getFeats: () => ({}),
};

const heroicAttributes = { "stamina": 7, "willpower": 5, "quickness": 7, "cleverness": 7, "level": 9 };
const heroicPlayer = {
  getAttributes: attr => heroicAttributes[attr] || heroicAttributes,
  getName:  () => 'Yv',
  getFeats: () => ({})
};

describe('The Feat Prereq Checking Functionality Happens Thusly:\n', () => {

  it('should be false if player does not meet any prereqs', () => {
    expect(meetsPrerequisites(fakePlayer, Feats.stun)).to.be.false;
  });

  it('should be false if the player only meets some prereqs', () => {
    expect(meetsPrerequisites(fakePlayer, Feats.leatherskin)).to.be.false;
  });

  describe('checking for Feat reqs: ', () => {

    it('should be false if the player does not meet all feat prereqs', () => {
      expect(meetsPrerequisites(heroicPlayer, Feats.ironskin)).to.be.false;
    });

    it('should be true if the player does meet all feat prereqs', () => {
      const moreHeroicPlayer = Object.assign(heroicPlayer, {
        getFeats: () => ({ 'leatherskin': true })
      });

      expect(meetsPrerequisites(moreHeroicPlayer, Feats.ironskin)).to.be.false;
    });

  });

});
