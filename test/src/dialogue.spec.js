const Dialogue = require('../../src/dialogue').Dialogue;
const expect = require('chai').expect;

describe('Basic keyword parsing', () => {

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


  it('should be true if the keyword is in the string', () => {
    expect(Dialogue.hasKeyword('thief', mockConfig)).to.be.true;
  });
});
