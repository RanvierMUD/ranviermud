var l10n_file = __dirname + '/../l10n/commands/character.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {

  return function(args, player) {

    var character = player.getAttributes() || {};
    player.sayL10n(l10n, 'ATTRIBUTES');

    for (var attr in character) {
      if (attr.indexOf('max') === -1 && attr !== experience) {
        player.sayL10n(l10n, attr.toUpperCase(), getStatusString(attr,
          character[attr], character));
      }
    }

    function getStatusString(attr, value, character) {
      var maxHealth = character.max_health;
      var maxSanity = character.max_sanity;
      var status = {
        level: getLevelText,
        health: getHealthText(maxHealth),
        class: function noop() {},
        sanity: getSanityText(maxSanity),
        stamina: getStamina,
        willpower: getWillpower,
        quickness: getQuickness,
        cleverness: getCleverness,
        mutagens: getMutagens
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
        20: 'a perseverer',
        28: 'an outlaster',
        35: 'an indweller',
        42: 'a defier of death',
        50: 'a reviver',
        55: 'an undying fiend',
      };

      for (var tier in titles) {
        if (level < parseInt(tier)) {
          return titles[tier];
        }
      }

      return "paragon";
    }

    function getHealthText(maxHealth) {
      return function(health) {
        var percentage = Math.floor(health / maxHealth);
        var noun = getGenderNoun(player.getGender());
        var healthStatus = {
          0: 'a dead ' + noun + ' walking',
          5: 'hanging by a thread',
          10: 'in excruciating pain',
          15: 'wracked by pain',
          25: 'maimed',
          35: 'gravely wounded',
          50: 'wounded',
          60: 'in awful shape',
          70: 'feeling poor',
          80: 'in average health',
          90: 'in good health',
          95: 'in great health',
          100: 'in perfect health'
        };
        var color = getStatusColor(percentage);
        for (var tier in healthStatus) {
          if (percentage <= parseInt(tier)) {
            return '<' + color + '>You are ' + healthStatus[tier] +
              '.</' + color + '>';
          }
        }
      }
    }

    function getSanityText(maxSanity) {
      return function(sanity) {
        var percentage = Math.floor(sanity / maxSanity);
        var noun = getGenderNoun(player.getGender());
        var sanityStatus = {
          0: '__❤z☀a☆l☂t☻h☯o☭r))<<',
          5: 'hanging by a thread',
          10: 'wondering where your marbles are',
          15: 'seeing unrealities',
          25: 'perceiving the unperceivable',
          35: 'feeling dysphoric',
          50: 'stressed to breaking',
          60: 'mentally unsound',
          70: 'feeling stressed',
          80: 'discontent',
          90: 'mentally well',
          95: 'quite stable',
          100: 'sharp as a knife'
        };

        var color = getStatusColor(percentage);
        for (var tier in sanityStatus) {
          if (percentage <= parseInt(tier)) {
            return '<' + color + '>You are ' + sanityStatus[tier] +
              '.</' + color + '>';
          }
        }
      }
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
      var attrStr = 'strength and endurance are '
      for (var tier in status) {
        if (stamina < parseInt(tier)) {
          return statusString(attrStr, status[tier], 'yellow');
        }
        return statusString(attrStr, 'unearthly savage', 'yellow');
      }
    }

    function getQuickness(quickness) {
      var status = {
        2: 'a slug',
        3: 'a sloth',
        5: 'an old ' + getGenderNoun(player.getGender()),
        7: 'an athlete',
        8: 'a fox',
        10: 'a leopard',
        12: 'a cheetah'
      };
      var attrStr = 'quickness is comparable to '

      for (var tier in status) {
        if (quickness <= parseInt(tier)) {
          return statusString(attrStr, status[tier], 'blue');
        }
        return statusString(attrStr, 'lasers', 'blue');
      }
    }

    // Helper functions
    //TODO: Extract to a util file if they'll be useful elsewhere.

    function statusString(attrStr, attr, color) {
      return '<' + color + '>Your ' + attrStr + attr + '</' + color + '>';
    }

    function getGenderNoun(gender) {
      var nouns = {
        M: 'man',
        F: 'woman',
        A: 'person'
      };
      return nouns[gender];
    }

    function getStatusColor(percentage) {
      return percentage > 50 ? 'green' : 'red'
    }

  };
};