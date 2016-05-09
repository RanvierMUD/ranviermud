/*
 * Feats -- in-game stylized as 'mutations' or whatever.
 */

var Effects = require('./effects.js').Effects;
var util = require('util');

var l10n_dir = __dirname + '/../l10n/skills/';
var l10ncache = {};
/**
 * Localization helper
 * @return string
 */


var L = function (locale, cls, key /*, args... */ ) {
  var l10n_file = l10n_dir + cls + '.yml';
  var l10n = l10ncache[cls + locale] || require('./l10n')(l10n_file);
  l10n.setLocale(locale);
  return l10n.translate.apply(null, [].slice.call(arguments).slice(2));
};

// For activate functions:
// Command event passes in player, args, rooms, npcs.
// TODO: Find a way to broadcast feat use to players in same room/area.


exports.Feats = {

  /// Passive feats
  leatherskin: {
    type: 'passive',
    cost: 2,
    prereqs: {
      'stamina': 2,
      'willpower': 2,
    },
    name: "Leatherskin",
    description: "Your skin has become tougher, and you are better able to take physical damage.",
    activate: player => {
      util.log(player.getName() + ' activates Leatherskin.');
      if (player.getEffects('leatherskin')) {
        player.removeEffect('leatherskin');
      }
      player.addEffect('leatherskin', Effects.health_boost({
        magnitude: 50,
        player: player,
        event: 'quit'
      }));
      player.say('Your skin hardens.');
    }
  }
};
