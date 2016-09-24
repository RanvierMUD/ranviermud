'use strict';

const Dialogue = require('../../src/dialogue').Dialogue;
const expect = require('chai').expect;
const sinon = require('sinon');

const Npc = require('../../src/npcs').Npc;
const Player = require('../../src/player').Player;

describe.only('Parsing Player/NPC Dialogue', () => {
  const sandbox = sinon.sandbox.create();

  const npc = new Npc({});
  const player = new Player({});

  const mockConfig = {

    npc,
    player,

    'thieves guild': {
      priority: Dialogue.Priority.LOW,
      keywords: {
        every: 'guild',
        some: ['thief', 'thieves', 'what'],
      },
      dialogue: {
        type: Dialogue.Types.SIMPLE,
        say: 'The man nods, "I need you to infiltrate the thieves guild for me, and find their roster."',
      },
    },

    'murder': {
      priority: Dialogue.Priority.HIGH,
      keywords: {
        every: 'guild',
        some: ['murder', 'killing', 'killings', 'dead'],
        find: ['assassin'],
      },
      dialogue: {
        type: Dialogue.Types.SIMPLE,
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
        type: Dialogue.Types.RANDOM,
        choices: [{
          say: '"This is my favorite place," he lies.',
          action: () => player.emit('experience', 500, 'lying')
        }, {
          say: '"There is a horrible creature in the basement," he warns.',
          action: () => player.emit('experience', 500, 'the basement')
        }]
      },
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
        type: Dialogue.Types.TIMED,
        sequence: [{
          say: '"We must seek vengeance.", he proclaims.',
          delay: 2.5 * 1000
        }, {
          say: '"They have overstepped their bounds and must be put down."'
        }, {
          say: '"Go," he utters, filled with seething rage.',
          action: () => player.emit('experience', 50, 'vengeance')
        }]
      },
    },

    'the awakening': {
      priority: Dialogue.Priority.MEDIUM,
      keywords: {
        every: 'how was the tavern',
        some: Dialogue.Keywords.BACKSTORY,
        find: Dialogue.Keywords.BACKSTORY,
      },
      dialogue: {
        type: Dialogue.Types.SEQUENCED,
        sequence: [{
            say: '"This tavern was the most popular in the city, before the Awakening," he said.',
            action: () => player.emit('experience', 75, 'the Awakening')
          },
          {
            say: 'He sighs heavily, "It was a good time for me."'
          }, {
            say: '"I was a bit taller, then. More real," mutters the metahuman.'
          }
        ],
      },
    }
  };

  //TODO: Prerequisites for each dialogue topic.

  describe('tokenization', () => {
    it('should be able to remove punctuation that might confuse the npc', () => {
      expect(Dialogue.stripPunctuation('hello world!')).to.eql('hello world');
    });
  });

  describe('prioritizing dialogue', () => {
    it('should be able to pick out the highest priority topic from a list', () => {
      const tokens = Dialogue.stripPunctuation('the thieves guild is doing a murder!');
      expect(Dialogue.getPriorityTopic(mockConfig, tokens)).to.eql(mockConfig['murder']); //TODO: Fix.
    });
  });

  describe('displaying dialogue to player', () => {
    beforeEach(() => {
      player.say = sandbox.spy();
      player.emit = sandbox.spy();
    });

    afterEach(() => sandbox.restore());

    describe('simple dialogue', () => {
      it('should say simple dialogue to player', () => {
        Dialogue.handleInteraction(mockConfig, 'What is the thieves guild?');
        const expectedLine = 'The man nods, "I need you to infiltrate the thieves guild for me, and find their roster."';
        expect(player.say.calledWith(expectedLine)).to.be.true;
      });

      it('should do an action if present on simple dialogue', () => {
        mockConfig['murder'].dialogue.action = sandbox.spy();
        Dialogue.handleInteraction(mockConfig, 'the thieves guild is doing a murder!');
        expect(mockConfig['murder'].dialogue.action.called).to.be.true;
      });
    });

    describe('randomized dialogue', () => {
      it('should choose option at random', () => {
        mockConfig['here'].dialogue.choices[0].action = sinon.spy();
        mockConfig['here'].dialogue.choices[1].action = sinon.spy();
        let i = 0;
        while(i++ < 10) {
          Dialogue.handleInteraction(mockConfig, 'Where am I, what is this place?');
        }

        expect(player.say.called).to.be.true;
        expect(mockConfig['here'].dialogue.choices[0].action.called).to.be.true;
        expect(mockConfig['here'].dialogue.choices[1].action.called).to.be.true;

      });
    });

  });

  describe('Error handling', () => {
    it('should throw if topic has no keywords', () => {
      const badConfig = Object.assign({}, mockConfig);
      delete badConfig['murder'].keywords;
      const badConfigTry = () => Dialogue.handleInteraction(badConfig, 'the thieves guild is doing a murder!');
      expect(badConfigTry).to.throw(ReferenceError);
    });

    it('should throw if no player or npc', () => {
      const horribleConfig = Object.assign({}, mockConfig);

      delete horribleConfig.player;
      const horribleConfigTry = () => Dialogue.handleInteraction(horribleConfig, 'stuff and things');

      expect(horribleConfigTry).to.throw(ReferenceError);

      horribleConfig.player = player;
      delete horribleConfig.npc;

      expect(horribleConfigTry).to.throw(ReferenceError);
    });

    it('should throw if dialogue type is unsupported', () => {
      const awfulConfig = Object.assign({}, mockConfig);
      awfulConfig['murder'].dialogue.type = "POTATOES";
      const awfulConfigTry = () => Dialogue.handleInteraction(awfulConfig, 'the thieves guild is doing a murder!');

      expect(awfulConfigTry).to.throw(ReferenceError);
    });
  });

});
