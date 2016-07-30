'use strict';
const Effects = require('./effects.js').Effects;
const util = require('util');
const CommandUtil = require('./command_util').CommandUtil;
const _ = require('./helpers');


/*
 * Feats -- in-game stylized as 'mutations' or whatever.
 */

/**
 * Localization helper
 * @return string
 */

// For activate functions:
// Command event passes in player, args, rooms, npcs, players.

const Feats = {


  /// Passive feats
  leatherskin: {
    type: 'passive',
    cost: 1,
    prereqs: {
      'stamina':   2,
      'willpower': 2,
      'level':     2,
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
    },
  },

  ironskin: {
    type: 'passive',
    cost: 2,
    prereqs: {
      'stamina':   4,
      'willpower': 2,
      'level':     5,
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
          player,
          target: player,
        }),
        Effects.haste({
          magnitude: .5,
          player,
        }),
        Effects.fortify({
          magnitude: 2,
          player,
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
      'willpower':  3,
      'cleverness': 4,
      'level':      5,
    },

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
      'level':     2,
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

  siphon: {
    type: 'active',
    cost: 2,
    prereqs: {
      'willpower': 3,
      'cleverness': 4,
      'level': 8,
    },
    id: 'siphon',
    name: 'Siphon',
    description: 'Drain others of their will to live, and restore your own.',
    activate: (player, args, rooms, npcs, players) => {
      util.log(player.getName() + ' activates Siphon.');
      const combatant = player.isInCombat();
      const target = _.firstWord(args);

      // Can hit combatant with no args, if possible.
      // Otherwise looks for target npc in room.

      if (combatant && !target) {
        return siphonTarget(combatant);
      }

      if (target) {
        const room = player.getRoom(rooms);
        const npc = CommandUtil.findNpcInRoom(npcs, target, room, player, true);
        if (npc) { return siphonTarget(npc); }
      }

      return player.say('<magenta>You find no one to siphon.</magenta>');


      function siphonTarget(target) {

        if (!player.hasEnergy(5)) {
          return player.say('<magenta>You will need to rest first.</magenta>');
        }

        const coolingDown = player.getEffects('siphoning');

        if (coolingDown) {
          player.say('You must wait before doing that again.');
          return;
        }

        const targetHealth = target.getAttribute('health');
        const siphoned = targetHealth / 10;
        target.setAttribute('health', targetHealth - siphoned);

        const healed = Math
          .min(player.getAttribute('max_health'),
               player.getAttribute('health') + siphoned);

        player.setAttribute('health', healed);
        deductSanity(player, siphoned);

        util.log(player.getName() + ' drains a ' + target.getShortDesc() + ' for ' + siphoned);

        const cooldown = 150 * 1000;
        player.addEffect('siphoning', { duration: cooldown });
        player.say('<red>You drain the life from ' + target.getShortDesc('en') + '.</red>');
      }
    }
  },

  secondwind: {
    type: 'active',
    cost: 1,
    prereqs: {
      'stamina':   2,
      'quickness': 2,
      'level':     2,
    },
    id:   'secondwind',
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
      'stamina':    3,
      'quickness':  3,
      'willpower':  4,
      'cleverness': 3,
      'level':      8,
    },
    id: 'regeneration',
    name: 'Regeneration',
    description: 'Restore your own broken tissues.',
    activate: (player, args, rooms, npcs, players) => {
      const cooldownNotOver = player.getEffects('regenerated') || player.getEffects('regen');

      if (cooldownNotOver) {
        player.say("You must wait before doing that again.");
        return;
      }

      const duration = 30  * 1000;
      const cooldown = 120 * 1000;
      const interval = 5   * 1000;
      const bonus    = 10;

      const config = {
        player,
        bonus,
        interval,
        isFeat: true,
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


/**
 * Does the player meet the prereqs for the feat, including cost?
 * @param  Player
 * @param  Feat
 * @return  bool True if they meet all conditions and can afford the feat.
 */
function meetsPrerequisites(player, feat) {
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

    return meets;
  }

  const isAffordable = feat.cost && attributes.mutagens >= feat.cost;
  return isAffordable;
}

function meetsFeatPrerequisites(player, featList) {
  const featsOwned = player.getFeats();
  return featList.filter(feat => feat in featsOwned).length > 0;
}

function deductSanity(player, cost) {
  const sanityCost = Math
    .max(player.getAttribute('sanity') - cost, 0);
  player.setAttribute('sanity', sanityCost);
  return sanityCost;
}

exports.Feats = Feats;
exports.meetsPrerequisites = meetsPrerequisites;
