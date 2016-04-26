'use strict';
const l10n_file = __dirname + '/../l10n/commands/character.yml';
const l10n = require('../src/l10n')(l10n_file);
const statusUtil = require('../src/status.js');
const Random = require('../src/random.js').Random;
exports.command = (rooms, items, players, npcs, Commands) => {

  return (args, player) => {

    const character = player.getAttributes() || {};
    player.sayL10n(l10n, 'ATTRIBUTES');

    for (let attr in character) {
      if (attr.indexOf('max') === -1 && attr !== 'experience') {
        player.sayL10n(l10n, attr.toUpperCase(), getStatusString(attr,
          character[attr], character));
      }
    }

    function getStatusString(attr, value, character) {
      const maxHealth = character.max_health;
      const maxSanity = character.max_sanity;
      const status = {
        level:       getLevelText,
        health:      statusUtil.getHealthText(maxHealth, player, null, true),
        class:       () => {},
        sanity:      statusUtil.getSanityText(maxSanity, player),
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
        2: 'pathetic',
        3: 'weak',
        5: 'mediocre',
        7: 'steady',
        8: 'athletic',
        10: 'vigorous',
        12: 'fierce'
      };
      const attrStr = 'strength and endurance are ';
      const topTier = 'unearthly savage';
      return evalStatus(stamina, status, attrStr, topTier,
        'blue');
    }

    function getQuickness(quickness) {
      const gender = statusUtil.getGenderNoun(player.getGender());
      const status = {
        1: 'sluggish',
        2: 'slothlike',
        3: 'like an old ' + gender,
        5: 'like an average ' + gender,
        7: 'like an athletic ' + gender,
        10: 'foxlike',
        12: 'catlike',
        16: 'like a cheetah'
      };
      const attrStr = 'quickness is ';
      const topTier = 'laser unicorns';
      return evalStatus(quickness, status, attrStr, topTier,
        'yellow');
    }

    function getCleverness(cleverness) {
      const status = {
        1: 'foggy',
        3: 'hazy',
        5: 'mundane at best',
        6: 'shrewd',
        8: 'adept',
        10: 'prodigious',
        12: 'wizardly'
      };
      const attrStr = 'mental acuity is ';
      const topTier = 'coruscating';
      return evalStatus(cleverness, status, attrStr, topTier, 'red');
    }

    function getWillpower(willpower) {
      const status = {
        1: 'sapped',
        2: 'pitiful',
        4: 'secure',
        6: 'unbending iron',
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

          const isArrayOfStrings = status[tier].length && status[tier][0].length;
          if (isArrayOfStrings) {
            const choice = Random.fromArray(status[tier]);
            return statusString(attrStr, choice, color);
          }

          return statusString(attrStr, status[tier], color);
        }
        return statusString(attrStr, defaultStr, color);
      }
    }


    function statusString(attrStr, attr, color) {
      return '<' + color + '>Your ' + attrStr + attr + '.</' + color + '>';
    }

  };
};
