'use strict';
const l10nFile = __dirname + '/../l10n/commands/character.yml';
const l10n = require('../src/l10n')(l10nFile);
const statusUtil = require('../src/status.js');
const Random = require('../src/random.js').Random;
exports.command = (rooms, items, players, npcs, Commands) => {

  return (args, player) => {

    const character = player.getAttributes() || {};
    player.sayL10n(l10n, 'ATTRIBUTES');

    const hiddenAttrs = ['experience', 'attrPoints', 'class'];
    for (let attr in character) {
      const playerFacing = hiddenAttrs.indexOf(attr) === -1;
      const shouldDisplay = attr.indexOf('max') === -1 && playerFacing;
      const hasMutagens = !(attr === 'mutagens' && !character[attr]);

      if (shouldDisplay && hasMutagens) {
        const status = getStatusString(attr, character[attr], character);
        return status ?
          player.say(attr.toUpperCase() + ': ' + status)
          : false;
      }
    }

    function getStatusString(attr, value, character) {
      const maxHealth = character.max_health;
      const maxSanity = character.max_sanity;
      const maxEnergy = character.max_energy;
      const status = {
        level:       getLevelText,
        health:      statusUtil.getHealthText(maxHealth, player, null, true),
        class:       () => {},
        sanity:      statusUtil.getSanityText(maxSanity, player),
        energy:      statusUtil.getEnergyText(maxEnergy, player),
        stamina:     getStamina,
        willpower:   getWillpower,
        quickness:   getQuickness,
        cleverness:  getCleverness,
        mutagens:    value => value === 1 ? value + ' more time' : value + ' more times',
        description: player.getDescription,
      };
      return status[attr](value) || '';
    }

    function getLevelText(level) {
      const titles = {
        3: ['a novice', 'a neonate'],
        8: ['a survivor', 'a surveyor'],
        13: ['an embittered survivor', 'the subject of hushed whispers'],
        15: ['an aimless wanderer', 'a hoarder of truths', 'a conquerer of horrors'],
        18: ['a purposeful wanderer', 'a distiller of fates', 'a hopeful figure amidst tragedy'],
        20: 'the perseverer',
        28: 'the outlaster',
        35: 'the indweller',
        42: 'the defier of death',
        50: 'the reviver',
        55: 'the undying',
      };

      const topTier = "the paragon";
      const attrStr = 'reputation precedes you as ';
      return evalStatus(level, titles, attrStr, topTier);

    }


    function getStamina(stamina) {
      const status = {
        1: ['pathetic', 'meager', 'corpselike'],
        2: ['weak', 'sorry', 'meager', 'frail'],
        3: ['mediocre', 'below average', 'weak', 'short-lived', 'easily broken'],
        5: ['steady', 'average'],
        7: ['athletic', 'impressive', 'long-lasting'],
        8: ['vigorous', 'savage', 'interminable'],
        10: ['fierce', 'interminable']
      };
      const attrStr = 'endurance is ';
      const topTier = 'unearthly';
      return evalStatus(stamina, status, attrStr, topTier,
        'blue');
    }

    function getQuickness(quickness) {
      const gender = statusUtil.getGenderNoun(player.getGender());
      const status = {
        1: ['slugs crawling', 'a sloth\'s napping', 'a maimed duck', 'those of a three-legged cat'],
        3: ['those of an old ' + gender, 'awkward lovemaking', 'an awkward puppy'],
        5: ['those of an average ' + gender, 'a flowing stream'],
        7: ['those of an athletic ' + gender, 'graceful dancing'],
        8: ['fleet foxes', 'those of nimble acrobats'],
        10: 'those of a wild cat stalking its prey'
      };
      const attrStr = 'movements resemble ';
      const topTier = 'a flash of light';
      return evalStatus(quickness, status, attrStr, topTier,
        'yellow');
    }

    function getCleverness(cleverness) {
      const status = {
        1: ['foggy', 'murky'],
        3: ['hazy', 'bogged down'],
        5: ['mundane at best', 'average', 'mediocre', 'unimpressive'],
        6: ['shrewd', 'bright', 'clear'],
        8: ['adept', 'impressive'],
        10: ['prodigious', 'genius-level'],
        12: 'wizardly'
      };
      const attrStr = 'mental acuity is ';
      const topTier = 'coruscating';
      return evalStatus(cleverness, status, attrStr, topTier, 'red');
    }

    function getWillpower(willpower) {
      const status = {
        1: ['sapped', 'broken'],
        2: ['pitiful', 'bent', 'brittle'],
        4: ['secure', 'unbent'],
        6: ['iron', 'unyielding'],
        8: 'an imposing force',
        10: 'uncanny'
      };
      const attrStr = 'will is ';
      const topTier = 'divine';
      return evalStatus(willpower, status, attrStr, topTier, 'bold');
    }

    // Helper functions

    function evalStatus(attr, status, attrStr, defaultStr, color) {
      color = color || 'magenta';

      for (let tier in status) {
        if (attr <= parseInt(tier, 10)) {

          const isArrayOfStrings = status[tier].length && status[tier][0].length > 1;
          if (isArrayOfStrings) {
            const choice = Random.fromArray(status[tier]);
            return statusString(attrStr, choice, color);
          }
          return statusString(attrStr, status[tier], color);
        }
      }

      return statusString(attrStr, defaultStr, color);
    }


    function statusString(attrStr, attr, color) {
      return '<' + color + '>Your ' + attrStr + attr + '.</' + color + '>';
    }

  };
};
