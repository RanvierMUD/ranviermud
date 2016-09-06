'use strict';

const Dialogue = require('../../src/dialogue').Dialogue;
const expect = require('chai').expect;

describe.only('Basic keyword parsing', () => {

  const mockConfig = {
    'thieves guild': {
      keywords: ['thieves', 'thief', 'stealing', 'guild'],
      priority: 4,
      prereqs: {
        introduced: true
      },
      dialogue: 'I need you to infiltrate the thieves guild for me, and find their roster.'
    }
  };

  describe('tokenization', () => {
    it('should be able to break a string into words', () => {
      expect(Dialogue.tokenizeSentence('hello world!')).to.eql(['hello', 'world']);
    });
  });

  describe('keyword finding', () => {
    it('should be true if the keyword is in the string', () => {
      expect(Dialogue.hasKeyword('thief', mockConfig['thieves guild'])).to.be.true;
    });

    it('should be false if the keyword is not in the string', () => {
      expect(Dialogue.hasKeyword('potatoes', mockConfig['thieves guild'])).to.be.false;
    });

  });

  describe('finding topics', () => {
    it('should return a list of a single topic if there is only one', () => {
      const tokens = Dialogue.tokenizeSentence('thieves guild');
      expect(Dialogue.findPotentialTopics(tokens, mockConfig).length === 1).to.be.true;
    });

    it('should return an empty array if there are no relevant topics', () => {
      const tokens = Dialogue.tokenizeSentence('pants helicopter');
      expect(Dialogue.findPotentialTopics(tokens, mockConfig).length === 0).to.be.true;
    });
  });

});
