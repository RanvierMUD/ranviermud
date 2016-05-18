'use strict';
const Effects = require('./effects.js').Effects;
const util = require('util');

const l10n_dir = __dirname + '/../l10n/skills/';
const l10ncache = {};

/*
 * Feats -- in-game stylized as 'mutations' or whatever.
 */


/**
 * Localization helper
 * @return string
 */


const L = function (locale, cls, key /*, args... */ ) {
  const l10n_file = l10n_dir + cls + '.yml';
  const l10n = l10ncache[cls + locale] || require('./l10n')(l10n_file);

  l10n.setLocale(locale);
  return l10n.translate.apply(null, [].slice.call(arguments).slice(2));
};

// For activate functions:
// Command event passes in player, args, rooms, npcs, players.


exports.Feats = {

  /// Passive feats
  leatherskin: {
    type: 'passive',
    cost: 1,
    prereqs: {
      'stamina': 2,
      'willpower': 2,
      'level': 2,
    },
    name: "Leatherskin",
    id: "leatherskin",
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
  },

  /// Active feats
  charm: {
    type: 'active',
    cost: 2,
    prereqs: {
      'willpower': 4,
      'cleverness': 2,
      'level': 5,
    },
    //TODO: Cooldown?
    name: 'Charm',
    id: 'charm',
    description: 'You are able to calm violent creatures and stop them from attacking you.',
    activate: (player, args, rooms, npcs, players) => {
      util.log(player.getName() + ' activates Charm.');
      const combatant = player.isInCombat();
      const charming = player.getEffects('charming');

      const turnOnCharm = () => player.addEffect('charming', {
        duration: 30 * 1000,
        deactivate: () => player.say('<yellow>You are no longer radiating calm and peace.</yellow>'),
        activate: () => player.say('<magenta>You radiate a calming, peaceful aura.</magenta>')
      });

      if (combatant && !charming) {
        player.say('<bold>' + combatant.getShortDesc(player.getLocale()) + ' stops fighting you.</bold>');
        combatant.setInCombat(false);
        player.setInCombat(false);
        turnOnCharm();
      } else if (!charming) {
        turnOnCharm();
      } else {
        player.say('You are already quite charming, really.');
      }
    }
  }
};

exports.meetsPrerequisites = _meetsPrerequisites;

/**
 * Does the player meet the prereqs for the feat, including cost?
 * @param  Player
 * @param  Feat
 * @return  bool True if they meet all conditions and can afford the feat.
 */
function _meetsPrerequisites(player, feat) {
  if (!feat.prereqs && !feat.cost) { return true; }
  const attributes = player.getAttributes();

  for (let attr in feat.prereqs || {}) {
    let req = feat.prereqs[attr];
    let stat = attributes[attr];

    let meets = req <= stat;
    util.log(player.getName() + '\'s ' + attr + ': ' + stat + ' vs. ' + req);

    if (!meets) { return false; }
  }

  const isAffordable = feat.cost && attributes.mutagens >= feat.cost;
  return isAffordable;
}
