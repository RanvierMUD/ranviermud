'use strict';

const statusUtil = require('../src/status.js');
const Random = require('../src/random.js').Random;
const _ = require('../src/helpers.js');

const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {

  return (args, player) => {

    const character = player.getAttributes() || {};
    player.say("<yellow><bold>You reflect on your existence.</yellow></bold>");

    const hiddenAttrs = ['experience', 'attrPoints', 'class'];
    for (let attr in character) {
      const playerFacing  = _.hasNot(hiddenAttrs, attr);
      const shouldDisplay = _.hasNot(attr, 'max') && playerFacing;
      const hasMutagens   = !(attr === 'mutagens' && !character[attr]);
      const longest       = 12; //TODO: Dynamically get length of longest attr label.

      if (shouldDisplay && hasMutagens) {
        const status = getStatusString(attr, character[attr], character);
        const label = getLabel(attr);

        if (status) {
          player.say('<cyan>' + label + ':</cyan> ' + _.leftPad(longest - label.length) + status);
        }
      }
    }

    function getLabel(str) {
      str = str.toUpperCase();
      const relabel = {
        'HEALTH': 'PHYSICAL',
        'SANITY': 'MENTAL',
        'LEVEL':  'REPUTATION'
      };
      return str in relabel ?
        relabel[str] : str;
    }

    function getStatusString(attr, value, character) {
      const maxHealth = character.max_health;
      const maxSanity = character.max_sanity;
      const maxEnergy = character.max_energy;
      const status = {
        health:      statusUtil.getHealthText(maxHealth, player, null, true),
        sanity:      statusUtil.getSanityText(maxSanity, player),
        energy:      statusUtil.getEnergyText(maxEnergy, player),
        stamina:     getStamina,
        willpower:   getWillpower,
        quickness:   getQuickness,
        cleverness:  getCleverness,
        mutagens:    value => value,
        level:       getLevelText,
        description: player.getDescription,
      };
      printSectionHeader(attr);
      return status[attr](value) || '';
    }

    function printSectionHeader(attr) {
      const headers = {
        'health':   'STATUS',
        'stamina':  'ATTRIBUTES',
        'level':    'CHARACTER'
      };

      const headerToPrint = headers[attr];
      if (headerToPrint) {
        const max = 16;
        const paddingAmount = (max - headerToPrint.length) + 1;
        const padding = _.leftPad(Math.ceil(paddingAmount / 2), '=');
        player.say('\n<cyan>' + padding + ' ' + headerToPrint + ' ' + padding + '</cyan>');
      }
    }

    function getLevelText(level) {
      const titles = {
        1:  'novice',
        5:  'neonate',
        7:  'survivor',
        10:  'surveyor',
        13:  'wanderer',
        18: 'whisperer of secrets',
        22: 'conquerer of horrors',
        27: 'distiller of fates',
        30: 'the perseverer',
        35: 'the outlaster',
        40: 'the indweller',
        45: 'the defier of death',
        50: 'the reviver',
        55: 'the undying',
      };

      const topTier = "the paragon";
      return evalStatus(level, titles, topTier);
    }


    function getStamina(stamina) {
      const status = {
        1: ['pathetic', 'meager', 'corpselike'],
        3: ['weak', 'sorry', 'meager', 'frail'],
        8: ['mediocre', 'subpar', 'weak', 'short-lived', 'easily broken'],
        10: ['steady', 'fit'],
        15: ['athletic', 'impressive', 'long-lasting'],
        20: ['vigorous', 'savage', 'interminable'],
        30: ['fierce', 'interminable']
      };

      const topTier = 'unearthly';
      return evalStatus(stamina, status, topTier, 'blue');
    }

    function getQuickness(quickness) {
      const gender = statusUtil.getGenderNoun(player.getGender());
      const status = {
        1: ['sluggish', 'slothly', 'slovenly', 'pitiable'],
        3: ['trudging', 'like an old ' + gender, 'awkward'],
        5: ['average', 'unimpressive'],
        10: ['nimble', 'speedy'],
        15: ['athletic', 'graceful'],
        20: ['acrobatic', 'fleet'],
        30: 'tiger-like'
      };

      const topTier = 'lightning';
      return evalStatus(quickness, status, topTier, 'yellow');
    }

    function getCleverness(cleverness) {
      const status = {
        1: ['foggy', 'murky'],
        4: ['hazy', 'bogged down'],
        5: ['mundane', 'average', 'mediocre', 'hackish'],
        10: ['shrewd', 'bright', 'clear', 'witty'],
        15: ['adept', 'impressive'],
        20: ['prodigious', 'genius-level'],
        30: 'wizardly'
      };

      const topTier = 'coruscating';
      return evalStatus(cleverness, status, topTier, 'red');
    }

    function getWillpower(willpower) {
      const status = {
        1: ['sapped', 'broken'],
        2: ['pitiful', 'bent', 'brittle'],
        6: ['secure', 'unbent'],
        10: ['iron', 'unyielding'],
        18: 'imposing',
        27: 'uncanny'
      };
      const topTier = 'divine';
      return evalStatus(willpower, status, topTier, 'bold');
    }

    // Helper functions

    function evalStatus(attr, status, defaultStr, color) {
      color = color || 'magenta';

      for (let tier in status) {
        if (attr <= parseInt(tier, 10)) {

          const isArrayOfStrings = Array.isArray(status[tier]);
          if (isArrayOfStrings) {
            const choice = Random.fromArray(status[tier]);
            return statusString(choice, color);
          }
          return statusString(status[tier], color);
        }
      }
      return statusString(defaultStr, color);
    }


    function statusString(attr, color) {
      return '<' + color + '>' + attr + '</' + color + '>';
    }

  };
};
