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
  const l10nFile = l10n_dir + cls + '.yml';
  const l10n = l10ncache[cls + locale] || require('./l10n')(l10nFile);

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
    },
  },

  ironskin: {
    type: 'passive',
    cost: 2,
    prereqs: {
      'stamina': 3,
      'willpower': 2,
      'level': 5,
      feats: ['leatherskin'],
    },
    name: 'Ironskin',
    id: 'ironskin',
    description: 'Your skin hardens further, into a layer of heavy metallic chitin.',
    activate: player => {
      util.log(player.getName() + ' activates Ironskin.');

      if (player.getEffects('ironskin0')) {
        player.removeEffect('ironskin0');
        player.removeEffect('ironskin1');
        player.removeEffect('ironskin2');
      }

      const ironSkinEffects = [
        Effects.health_boost({
          magnitude: 100,
          player: player,
          target: player,
        }),
        Effects.haste({
          magnitude: .5,
          player: player,
        }),
        Effects.fortify({
          magnitude: 2,
          player: player,
        })
      ];

      ironSkinEffects.forEach((effect, i) => {
          player.addEffect('ironskin' + i, effect);
      });

      player.say('<cyan><bold>Clank.</bold></cyan>');
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
        deductSanity(player, 15);
      } else if (!charming) {
        turnOnCharm();
      } else {
        player.say('You are already quite charming, really.');
      }
    }
  },

  stun: {
    type: 'active',
    cost: 1,
    prereqs: {
      'willpower': 2,
      'level': 2
    },
    id: 'stun',
    name: 'Stun',
    description: 'Use your will to temporarily daze an opponent, slowing their reaction time.',
    activate: (player, args, rooms, npcs, players) => {
      util.log(player.getName() + ' activates Charm.');
      const combatant = player.isInCombat();

      if (!combatant) {
        player.say('You have no target to stun.');
        return;
      }

      const stunning = player.getEffects('stunning') || combatant.getEffects('stunned');

      if (stunning) {
        player.say('You must wait before doing that again.');
        return;
      }

      const cooldown = 15 * 1000;
      combatant.addEffect('stunned', {
        duration: 5 * 1000,
        deactivate: () => {
          player.say('<yellow>Your opponent is no longer stunned.</yellow>')
          setTimeout(player.removeEffect.bind(null, 'stunning'), cooldown);
        },
        activate: () => {
          player.say('<magenta>You concentrate on stifling your opponent.</magenta>');

          deductSanity(player, 10);
          player.addEffect('stunning', Effects.slow({
            target: combatant,
            magnitude: 5,
          }));
        },
      });
    }
  },

  secondwind: {
    type: 'active',
    cost: 1,
    prereqs: {
      'stamina': 2,
      'quickness': 2,
    },
    id: 'secondwind',
    name: 'Second Wind',
    description: 'Reinvigorate yourself in an instant.',
    activate: (player, args, rooms, npcs, players) => {
      const cooldownNotOver = player.getEffects('secondwind');

      if (cooldownNotOver) {
        player.say("You must wait before doing that again.");
        return;
      }

      deductSanity(player, 15);
      player.setAttribute('energy', player.getAttribute('max_energy'));

      const cooldown = 120 * 1000;
      player.addEffect('secondwind', {
        duration: cooldown,
        deactivate: () => {},
        activate: () => player.say('<magenta>You feel a fell energy coursing through your veins.</magenta>'),
      });
    },
  },

  regeneration: {
    type: 'active',
    cost: 1,
    prereqs: {
      'stamina': 3,
      'quickness': 3,
      'willpower': 4,
      'cleverness': 3,
      'level': 6,
    },
    id: 'regeneration',
    name: 'Regeneration',
    description: 'Restore your own broken tissues.',
    activate: (player, args, rooms, npcs, players) => {
      const cooldownNotOver = player.getEffects('regenerated') || player.getEffects('regen');
      const duration = 30 * 1000;
      const cooldown = 120 * 1000;

      if (cooldownNotOver) {
        player.say("You must wait before doing that again.");
        return;
      }

      const bonus = 10;
      const config = {
        player,
        bonus,
        stat: 'health',
        callback: () => { // on deactivate
          util.log(player.getName() + ' regen is deactivated.');
          player.addEffect('regenerated', { duration: cooldown });
          player.say('<green>You feel a dull ache as your body stops stitching itself back together.</green>')
        },
      };

      player.say("<blue>You feel your own flesh mending itself.</blue>");

      deductSanity(player, 25);

      player.addEffect('regen', Effects.regen(config));
    },
  },

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

  for (const attr in feat.prereqs || {}) {
    if (attr === 'feats') {
      return meetsFeatPrerequisites(player, feat.prereqs.feats);
    }
    const req = feat.prereqs[attr];
    const stat = attributes[attr];

    const meets = req <= stat;
    util.log(player.getName() + '\'s ' + attr + ': ' + stat + ' vs. ' + req);

    if (!meets) { return false; }
  }

  const isAffordable = feat.cost && attributes.mutagens >= feat.cost;
  return isAffordable;
}

function meetsFeatPrerequisites(player, featList) {
  const featsOwned = player.getFeats();
  return featList.filter(feat => feat in featsOwned).length > 0;
}

function deductSanity(player, cost) {
  const sanityCost = Math.max(player.getAttribute('sanity') - cost, 0);
  player.setAttribute('sanity', sanityCost);
  return sanityCost;
}
