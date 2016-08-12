// A file of helper functions for getting player/npc status-related strings.
//TODO: Dry this up more.
module.exports = {
  getHealthText: getHealthText,
  getSanityText: getSanityText,
  getGenderNoun: getGenderNoun,
  getStatusColor: getStatusColor,
  getPercentage: getPercentage,
  getEnergyText: getEnergyText,
};

function getHealthText(maxHealth, player, npc) {
  return function(health) {
    var locale = player ? 'en' : 'en';
    var isPlayer = !npc;
    var percentage = getPercentage(health, maxHealth);
    var descriptor = isPlayer ?
      '' : '<cyan>' + npc.getShortDesc(locale).toUpperCase() + ':</cyan> ';
    var color = getStatusColor(percentage);

    var healthStatus = {
      0: 'dead',
      5: 'near death',
      10: 'excruciating',
      15: 'wrecked',
      25: 'maimed',
      35: 'grave',
      50: 'wounded',
      60: 'awful',
      70: 'poor',
      80: 'average',
      90: 'great',
      95: 'robust',
      100: 'perfect',
    };

    for (var tier in healthStatus) {
      if (percentage <= parseInt(tier)) {
        return '<' + color + '>' + descriptor + healthStatus[tier] +
          '</' + color + '>';
      }
    }
  }
}

function getSanityText(maxSanity, player) {
  return function(sanity) {
    var percentage = getPercentage(sanity, maxSanity);
    var sanityStatus = {
      0:  'insane',
      10: 'mad',
      15: 'dysphoric',
      50: 'unsound',
      60: 'stressed',
      70: 'ill',
      80: 'discontent',
      90: 'content',
      95: 'stable',
      100: 'sharp'
    };

    var color = getStatusColor(percentage);
    for (var tier in sanityStatus) {
      if (percentage <= parseInt(tier)) {
        return '<' + color + '>' + sanityStatus[tier] +
          '</' + color + '>';
      }
    }
    return '<' + color + '>strange</' + color + '>';
  }
}

function getEnergyText(maxEnergy, player) {
  return function(energy) {
    var percentage = getPercentage(energy, maxEnergy);
    var energyStatus = {
      0:  'depleted',
      10: 'exhausted',
      15: 'spent',
      50: 'drowsy',
      60: 'tired',
      70: 'fatigued',
      80: 'weary',
      90: 'active',
      95: 'spry',
      100: 'fresh'
    };

    var color = getStatusColor(percentage);
    for (var tier in energyStatus) {
      if (percentage <= parseInt(tier)) {
        return '<' + color + '>' + energyStatus[tier] +
          '</' + color + '>';
      }
    }
    return '<' + color + '>strange</' + color + '>';
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
  return percentage > 75 ?
    'green' : percentage > 35 ?
      'yellow' : 'red';
}

function getPercentage(numerator, denominator){
  return Math.floor((numerator / denominator) * 100);
}
