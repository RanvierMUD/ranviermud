const expect = require('chai').expect;
const Feats = require('../../src/feats').Feats
const meetsPrerequisites = require('../../src/feats').meetsPrerequisites;

const fakeAttributes = { "stamina": 2, "willpower": 1, "quickness": 1, "cleverness": 1, "level": 2 };
const fakePlayer = {
  getAttributes: attr => fakeAttributes[attr] || fakeAttributes,
  getName:  () => 'Lady Barcelona',
  getFeats: () => ({}),
};

describe('The Feat Prereq Checking Functionality Happens Thusly:\n', () => {

  it('should be false if player does not meet any prereqs', () => {
    expect(meetsPrerequisites(fakePlayer, Feats.stun)).to.be.false;
  });

  it('should be false if the player only meets some prereqs', () => {
    expect(meetsPrerequisites(fakePlayer, Feats.leatherskin)).to.be.false;
  })

});
