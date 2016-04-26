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
      var titles = {
        3: 'a novice',
        8: 'a survivor',
        13: 'an embittered survivor',
        15: 'an aimless wanderer',
        18: 'a purposeful wanderer',
        20: 'the perseverer',
        28: 'the outlaster',
        35: 'the indweller',
        42: 'the defier of death',
        50: 'the reviver',
        55: 'the undying',
      };

      for (var tier in titles) {
        if (level < parseInt(tier)) {
          return titles[tier];
        }
      }

      return "the paragon";
    }


    function getStamina(stamina) {
      var status = {
        2: 'pathetic',
        3: 'weak',
        5: 'mediocre',
        7: 'steady',
        8: 'athletic',
        10: 'vigorous',
        12: 'fierce'
      };
      var attrStr = 'strength and endurance are ';
      return evalStatus(stamina, status, attrStr, 'unearthly savage',
        'blue');
    }

    function getQuickness(quickness) {
      var gender = statusUtil.getGenderNoun(player.getGender());
      var status = {
        1: 'a slug',
        2: 'a sloth',
        3: 'an old ' + gender,
        5: 'an average ' + gender,
        7: 'an athletic ' + gender,
        10: 'a fox',
        12: 'a leopard in the snow',
        16: 'a cheetah'
      };
      var attrStr = 'quickness is comparable to '
      return evalStatus(quickness, status, attrStr, 'laser unicorns',
        'yellow');
    }

    function getCleverness(cleverness) {
      var status = {
        1: 'foggy',
        3: 'hazy',
        5: 'mundane at best',
        6: 'shrewd',
        8: 'adept',
        10: 'prodigious',
        12: 'wizardly'
      };
      var attrStr = 'mental acuity is ';
      return evalStatus(cleverness, status, attrStr, 'coruscating', 'red');
    }

    function getWillpower(willpower) {
      var status = {
        1: 'sapped',
        2: 'pitiful',
        4: 'secure',
        6: 'unbending iron',
        8: 'an imposing force',
        10: 'uncanny'
      };
      var attrStr = 'will is ';
      return evalStatus(willpower, status, attrStr, 'divine', 'bold');
    }

    // Helper functions

    function evalStatus(attr, status, attrStr,
      defaultStr, color) {
      for (var tier in status) {
        if (attr <= parseInt(tier)) {
          return statusString(attrStr, status[tier], color);
        }
        return statusString(attrStr,
          defaultStr, color);
      }
    }


    function statusString(attrStr, attr, color) {
      return '<' + color + '>Your ' + attrStr + attr + '.</' + color + '>';
    }

  };
};
