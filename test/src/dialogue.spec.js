'use strict';

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
      dialogue: {
        type: Dialogue.Type.SIMPLE,
        say: 'The man nods, "I need you to infiltrate the thieves guild for me, and find their roster."',
    },
    'murder': {
      priority: Dialogue.Priority.HIGH,
      keywords: {
        every: 'guild',
        some: ['murder', 'killing', 'killings', 'dead'],
        find: ['assassin'],
      },
      dialogue: {
        type: Dialogue.Type.SIMPLE,
        say: '"The thieves have become assassins? We cannot have two assassin\'s guilds," the man says, grimacing.',
        action: () => player.emit('experience', 500, 'the frail politics between the two guilds')
      }
    },
    'here': {
      priority: Dialogue.Priority.LOWEST,
      keywords: {
        some: ['here', 'this place', 'where'],
        find: ['wh'],
      },
      dialogue: {
        type: Dialogue.Type.RANDOM
        say: [
        '"This is my favorite place," he said.',
        '"It is so great here," he mumbled unconvincingly.',
      ]},
    },
    'quest': {
      priority:
        () => {
          const level = { min: 5, max: 10 };
          const playerLevel = player.getAttribute('level');
          const withinLevelRestriction = playerLevel < level.min || playerLevel > level.max;
          return withinLevelRestriction ? Dialogue.Priority.HIGHEST : Dialogue.Priority.LOW;
        },
      keywords: {
        some: Dialogue.Keywords.QUEST.concat(['two']),
        find: Dialogue.Keywords.QUEST.concat(['two']),
      },
      dialogue: {
        type: Dialogue.Type.TIMED,
        sequence: [{
          say:   '"We must seek vengeance.", he proclaims.',
          delay: 2.5 * 1000
        }, {
          say:   '"They have overstepped their bounds and must be put down."'
        }, {
          say:   '"Go," he utters, filled with seething rage.'
          action: () => player.emit('experience', 50, 'vengeance')
        }]
    },
    'the awakening': {
      priority: Dialogue.Priority.MEDIUM,
      keywords: {
        every: 'how was the tavern',
        some: Dialogue.Keywords.BACKSTORY,
        find: Dialogue.Keywords.BACKSTORY,
      },
      dialogue: {
        type: Dialogue.Type.SEQUENCED,
        sequence: [{
          say: '"This tavern was the most popular in the city, before the Awakening," he said.',
          action: () => player.emit('experience', 75, 'the Awakening')
        },
        {
          say: 'He sighs heavily, "It was a good time for me."'
        }, {
          say: '"I was a bit taller, then. More real," mutters the metahuman.'
      }],
    },
  };

  const player = {};


  describe('tokenization', () => {
    it('should be able to break a string into words', () => {
      expect(Dialogue.tokenizeSentence('hello world!')).to.eql(['hello', 'world']);
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
