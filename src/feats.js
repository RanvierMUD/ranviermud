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
      player.addEffect('leatherskin', Effects.defenseBoost({
        magnitude: 1.15,
        player,
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
      if (player.getEffects('ironskin')) {
        player.removeEffect('leatherskin');
      }
      player.addEffect('ironskin', Effects.defenseBoost({
        player,
        magnitude: 2.05,
        event: 'quit'
      }));
      player.addEffect('ironskin_slow', Effects.haste({
        target: player,
        magnitude: .5,
        effect: 'quit'
      }));
      player.say('<cyan><bold>Clank.</bold></cyan>');
    }
  },

  assense: {
    type: 'passive', // may end up being active instead?
    cost: 1,
    prereqs: {
      stamina:    1,
      willpower:  3,
      cleverness: 3,
      level:      7,
    },

    name: 'Assense Auras',
    id: 'assense',
    description: 'You are sensitive to the auras of others.',
    activate: player => {
      player.setAttribute('willpower',  player.getAttribute('willpower')  + 1);
      player.setAttribute('cleverness', player.getAttribute('cleverness') + 1);
    },
    deactivate: player => {
      player.setAttribute('willpower',  player.getAttribute('willpower')  - 1);
      player.setAttribute('cleverness', player.getAttribute('cleverness') - 1);
    },
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
      const combatants = player.getInCombat();
      const charming = player.getEffects('charming');

      // TODO: Extract these to a skills/charm.js file
      const turnOnCharm = () => player.addEffect('charming', {
        duration: 30 * 1000,
        deactivate: () => {
          player.warn('You are no longer radiating calm and peace.');
          player.setAttribute('cleverness', player.getAttribute('cleverness') - 1);
        },
        activate: () => {
          player.setAttribute('cleverness', player.getAttribute('cleverness') + 1);
          player.say('<magenta>You radiate a calming, peaceful aura.</magenta>');
        }
      });

      const removeFromCombat = combatant => {
        player.say('<bold>' + combatant.getShortDesc('en') + ' stops fighting you.</bold>');
        combatant.fleeFromCombat();
      }

      if (combatants.length && !charming) {
        player.fleeFromCombat();
        combatants.map(removeFromCombat);
        turnOnCharm();
        deductSanity(player, 15 + combatants.length);
      } else if (!charming) {
        turnOnCharm();
      } else {
        player.warn('You are already quite charming, really.');
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
      const combatants = player.getInCombat();
      const potentialTargets = combatants.length === 1 ?
        combatants :
        combatants
          .filter(enemy =>
            enemy.hasKeyword(args) ||
            enemy.getShortDesc().includes(args) ||
            enemy.getName().toString().includes(args));

      if (!args || !potentialTargets.length) {
        player.say('Stun whom?');
        return;
      }

      const target = potentialTargets[0];

      const stunning = player.getEffects('stunning') || target.getEffects('stunned');

      if (stunning) {
        player.say('You must wait before doing that again.');
        return;
      }

      const cooldown = 15 * 1000;
      target.addEffect('stunned', {
        duration: 5 * 1000,

        activate: () => {
          player.say('<magenta>You concentrate on stifling your opponent.</magenta>');
          const strongestMentalAttr = Math.max(player.getAttribute('willpower'), player.getAttribute('cleverness'));
          const magnitude = player.getAttribute('level') + strongestMentalAttr;
          target.combat.addDodgeMod({
            name: 'stunned',
            effect: dodge => Math.max(dodge - magnitude, 0)
          });
          target.combat.addToHitMod({
            name: 'stunned',
            effect: toHit => Math.max(toHit - magnitude, 0)
          })
          player.addEffect('stunning', Effects.slow({
            target,
            magnitude,
          }));
          const sanityCost = 11 + Math.round(magnitude / 2);
          deductSanity(player, sanityCost);
        },

        deactivate: () => {
          player.say('<yellow>Your opponent is no longer stunned.</yellow>');
          combatant.combat.removeDodgeMod('stunned');
          setTimeout(player.removeEffect.bind(null, 'stunning'), cooldown);
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

        if (!player.hasEnergy(5, items)) {
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

        util.log(player.getName() + ' drains a ' + target.getShortDesc('en') + ' for ' + siphoned);

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
        player.say("Your heart would surely explode. You must wait.");
        return;
      }

      deductSanity(player, 15);
      player.setAttribute('energy', player.getAttribute('max_energy'));

      const modifier = Math.ceil(player.getAttribute('level') / 10) + 1;
      player.combat.addSpeedMod({
        name: 'secondwind',
        effect: speed => speed * modifier
      });

      const cooldown = 120 * 1000;

      player.addEffect('secondwind', {
        duration: cooldown,
        activate: () => player.say('<magenta>You feel a fell energy coursing through your veins.</magenta>'),
        deactivate: () => {
          player.combat.removeSpeedMod('secondwind');
          player.addEffect('secondwind_hangover', {
            duration: cooldown / 4,

            activate: () => {
              player.combat.addSpeedMod({
                name: 'secondwind_hangover',
                effect: speed => speed * .80
              });
              player.say('<magenta>Your heartbeat is erratic...</magenta>');
            },

            deactivate: () => {
              player.combat.removeSpeedMod('secondwind_hangover');
              player.say('<magenta>You feel normal again.</magenta>');
            },
          })
        },
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

  let meetsAllPrerequisites = true;
  for (const attr in feat.prereqs || {}) {
    const checkingFeats  = attr === 'feats';
    const hasNeededFeats = checkingFeats?
      meetsFeatPrerequisites(player, feat.prereqs.feats) :
      true;
    if (checkingFeats) { util.log('Meets feat reqs? ', hasNeededFeats); }
    const req  = feat.prereqs[attr];
    const stat = attributes[attr];

    const meets = checkingFeats ?
      hasNeededFeats :
      req <= stat;

    if (!checkingFeats) {
      util.log(player.getName() + '\'s ' + attr + ': ' + stat + ' vs. ' + req + '-- meets prereq? \n\t', meets);
    }

    meetsAllPrerequisites = meetsAllPrerequisites ?
      meets : false;
  }

  const isAffordable = feat.cost && attributes.mutagens >= feat.cost;
  return isAffordable && meetsAllPrerequisites;
}

function meetsFeatPrerequisites(player, featList) {
  const featsOwned = player.getFeats();
  return featList.every(feat => featsOwned[feat]);
}

//TODO: Use an event emitter instead.
function deductSanity(player, cost) {
  cost = Math.max(cost - player.getSkills('concentration'), 0);
  const sanityCost = Math.max(player.getAttribute('sanity') - cost, 0);
  player.setAttribute('sanity', sanityCost);
  return sanityCost;
}

exports.Feats = Feats;
exports.meetsPrerequisites = meetsPrerequisites;
