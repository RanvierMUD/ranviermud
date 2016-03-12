// A file of helper functions for getting player/npc status-related strings.
//TODO: Dry this up more.
module.exports = {
  getHealthText: getHealthText,
  getSanityText: getSanityText,
  getGenderNoun: getGenderNoun,
  getStatusColor: getStatusColor,
  getPercentage: getPercentage
};

function getHealthText(maxHealth, player, npc) {
  return function(health) {
    var locale = player.getLocale();
    var isPlayer = !npc;
    var percentage = getPercentage(health, maxHealth);
    var noun = isPlayer ? getGenderNoun(player.getGender()) : 'creature';
    var nounPhrase = isPlayer ? 'You are ' : npc.getShortDesc(locale) +
      ' is ';
    var color = getStatusColor(percentage);

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

    for (var tier in healthStatus) {
      if (percentage <= parseInt(tier)) {
        return '<' + color + '>' + nounPhrase + healthStatus[tier] +
          '.</' + color + '>';
      }
    }
  }
}

function getSanityText(maxSanity, player) {
  return function(sanity) {
    var percentage = getPercentage(sanity, maxSanity);
    var sanityStatus = {
      0: 'consumed by thoughts of suicide',
      5: 'hanging by a thread',
      10: 'nearing insanity',
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
      } //TODO: Dry this, too.
    }
    return '<' + color + '>You are feeling strange.</' + color + '>';
  }
}

function getGenderNoun(gender) {
  var nouns = {
    M: 'man',
    F: 'woman',
    A: 'person'
  };
  return nouns[gender] || nouns.A;
}

function getStatusColor(percentage) {
  return percentage > 50 ? 'green' : 'red'
}

function getPercentage(numerator, denominator){
  return Math.floor((numerator / denominator) * 100);
}