'use strict';
ggytffty7
const Dialogue = require('../../src/dialogue').Dialogue;
const expect = require('chai').expect;

describe.only('Basic keyword parsing', () => {
  const mockConfig = {
    'thieves guild': {
      priority: Dialogue.Priority.LOW,
      keywords: {
        every: 'guild',
        some:  ['thief', 'thieves', 'what'],
      },
      dialogue: 'I need you to infiltrate the thieves guild for me, and find their roster.',
    },
    'murder': {
      priority: Dialogue.Priority.HIGH,
      keywords: {
        every: 'guild',
        some: ['murder', 'killing', 'killings', 'dead'],
        find: ['assassin'],
      },
      dialogue: 'The thieves have become assassins? We cannot have two assassin\'s guilds...',
    },
    'here': {
      priority: Dialogue.Priority.LOWEST,
      keywords: {
        some: ['here', 'this place', 'where'],
        find: ['wh'],
      },
      dialogue: [
        'This is my favorite place.',
        'It is so great here.',
      ],
    },
    'quest': {
      priority:
      ({ key, player, level }) =>
        player.getAttribute('level') < level.min ||
        player.getAttribute('level') > level.max ?
          Dialogue.Priority.HIGHEST : Dialogue.Priority.LOW,
      keywords: {
        some: Dialogue.Keywords.QUEST.concat(['two']),
        find: Dialogue.Keywords.QUEST.concat(['two']),
      },
      dialogue: Dialogue.sequence([{
        say:   'We must seek vengeance.',
        delay: 2.5 * 1000
      }, {
        say:   'They have overstepped their bounds and must be put down.'
      }, {
        say:   'Go.'
      }]);
    }
  };

  const player = {};

  
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

  describe('prioritizing dialogue', () => {
    it('should be able to pick out the highest priority topic from a list', () => {
      const tokens = Dialogue.tokenizeSentence('the thieves guild is doing a murder!');
      const topics = Dialogue.findPotentialTopics(tokens, mockConfig);

      expect(Dialogue.getPriorityTopic(topics, mockConfig)).to.eql(mockConfig['murder']);
    });
  });

  describe('Getting next NPC dialogue choice', () => {

    it('should return a string as the next dialogue choice', () => {
      const npcDialogue = Dialogue.getNpcResponse('what is the thieves guild?', mockConfig);
      expect(npcDialogue).to.equal(mockConfig['thieves guild'].dialogue);
    });

    it('should return null if no NPC dialogue is found', () => {
      const npcDialogue = Dialogue.getNpcResponse('potatos?', mockConfig);
      expect(npcDialogue).not.to.be.ok;
    });

    it('should still return a string or series of strings if the NPC can say multiple things', () => {
      const dialogueArray = mockConfig['here'].dialogue;
      let dialogueSpoken = [];
      while (dialogueSpoken.length < 100) {
        dialogueSpoken.push(Dialogue.getNpcResponse('here', mockConfig));
      }
      dialogueArray.forEach(blurb => {
        expect(dialogueSpoken.indexOf(blurb) > -1).to.be.true;
      });
    });
  });

});
