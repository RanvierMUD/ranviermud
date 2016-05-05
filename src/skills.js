var Effects = require('./effects.js').Effects;
var util = require('util');

var l10n_dir = __dirname + '/../l10n/skills/';
var l10ncache = {};
/**
 * Localization helper
 * @return string
 */


var L = function(locale, cls, key /*, args... */ ) {
  var l10n_file = l10n_dir + cls + '.yml';
  var l10n = l10ncache[cls + locale] || require('./l10n')(l10n_file);
  l10n.setLocale(locale);
  return l10n.translate.apply(null, [].slice.call(arguments).slice(2));
};

exports.Skills = {
  //// Cleverness-related skills.
  pick: {
    cost: 2,
    name: "Lockpick",
    description: "Your ability to pick or force open locked doors or containers.",
    attribute: "cleverness",
    activate: () => { util.log("Activated lockpick."); };
  }
};

// physical: {
//   leatherskin: {
//     type: 'passive',
//     cost: 2,
//     // no prereqs
//     name: "Leatherskin",
//     description: "Your skin has become tougher, and you are better able to take physical damage.",
//     activate: function(player) {
//       if (player.getEffects('leatherskin')) {
//         player.removeEffect('leatherskin');
//       }
//       player.addEffect('leatherskin', Effects.health_boost({
//         magnitude: 50,
//         //consider adding +1 to stamina
//         player: player,
//         event: 'quit'
//       }));
//     }
//   }
