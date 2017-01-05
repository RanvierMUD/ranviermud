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

      const level = player.getAttribute('level');
      const bonus = Math.min(Math.ceil(level / 4), 5);

      player.addEffect('leatherskin', {
        type:          'defense_boost',
        combatModName: 'leatherskin',
        name:          'Leatherskin',
        desc:          'Your skin has hardened into tough, leathery hide.',
        aura:          'leather',
        defenseBonus:   bonus,
        healthBonus:    bonus * 5,
        activate:       () => player.combat.addSpeedMod({
          name: 'leatherskin',
          effect: speed => speed + 500
        })
      });

      player.say("<bold>Your skin hardens into a leathery hide.</bold>");
    },
  },

  ironskin: {
    type: 'passive',
    cost: 2,
    prereqs: {
      'stamina':   5,
      'willpower': 2,
      'level':     12,
      feats: ['leatherskin'],
    },
    name: 'Ironskin',
    id: 'ironskin',
    description: 'Your skin hardens further, into a layer of heavy metallic chitin.',
    activate: player => {

      const level = player.getAttribute('level');
      const bonus = Math.min(Math.ceil(level / 2), 15);

      player.addEffect('ironskin', {
        type:          'defense_boost',
        combatModName: 'ironskin',
        name:          'Ironskin',
        aura:          'steeliness',
        desc:          'Your skin has an iron-like chitin coating it.',
        defenseBonus:   bonus * 4,
        healthBonus:    bonus + 5,
        activate:       () => player.combat.addSpeedMod({
          name: 'ironskin',
          effect: speed => speed * 1.5
        })
      });

      player.say("<bold><blue>Clank.</blue></bold>");
    }
  },

  assense: {
    type: 'passive', // may end up being active instead?
    cost: 1,
    prereqs: {
      willpower:  3,
      cleverness: 3,
      level:      5,
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

  /// Active feats ///
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

      const charming    = player.getEffects('charm');
      const coolingDown = target.getEffects('charm cooldown');

      if (charming)    { return player.warn('You are already quite charming, really.'); }
      if (coolingDown) { return player.warn('You must wait for some time before doing that again.'); }

      deductSanity(player, 15 + player.getInCombat().length);

      const cooldown = 60 * 1000;
      const duration = player.getAttribute('cleverness') + player.getAttribute('willpower') * 1000;
      const bonus    = Math.ceil(player.getAttribute('level') / 5);

      player.addEffect('charm', {
        type: 'charm',

        duration, bonus,

        deactivate: () => player.warn('You are no longer radiating calm and peace.'),
        activate:   () => {
          const cost = Math.max(Math.ceil(player.getAttribute('cleverness') / 2), 2);
          player.say('<magenta>You radiate a calming, peaceful aura.</magenta>');
          player.addEffect('charm cooldown', {
            type: 'willpower_cooldown',
            duration: cooldown + duration,
            cost
          });
        },
      });
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
        combatants.filter(enemy => args ?
          (enemy.hasKeyword(args)
          || enemy.getShortDesc().includes(args)
          || enemy.getName().toString().includes(args)) :
          []);

      if (!potentialTargets.length) {
        return player.say('Stun whom?');
      }

      const target = potentialTargets[0];

      const stunning = player.getEffects('stun cooldown');
      const alreadyStunned = target.getEffects('stunned');

      if (stunning || alreadyStunned) {
        return player.say('You must wait before doing that again.');
      }

      const level    = player.getAttribute('level');
      const will     = player.getAttribute('willpower');
      const cooldown = Math.max((60 * 1000) - (level * 1000), 6000);
      const duration = Math.min((level / 4) * 3000, 30 * 1000);
      const factor   = Math.round((level + will / 4) + (player.getAttribute('cleverness') / 8));

      target.addEffect('stunned', {
        duration,
        factor,
        type: 'stun',

        activate: () => {
          player.say(`<magenta>You concentrate on stifling ${target.getShortDesc()}.</magenta>`);

          const sanityCost = 11 + Math.round(factor / 2);
          deductSanity(player, sanityCost);

          player.addEffect('stun cooldown', {
            type: 'willpower_cooldown',
            duration: cooldown,
            cost: Math.max(1, target.getAttribute('level') - will)
          });
        },

        deactivate: () => player.warn(`Your opponent, ${target.getShortDesc()} is free of your power.`),
      });
    }
  },

  siphon: {
    type: 'active',
    cost: 2,
    prereqs: {
      'stamina':    3,
      'willpower':  3,
      'cleverness': 4,
      'level':      14,
    },
    id: 'siphon',
    name: 'Siphon',
    description: 'Drain others of their will to live, and restore your own.',
    activate(player, args, rooms, npcs, players, items) {
      util.log(player.getName() + ' activates Siphon.');
      const combatant = player.getInCombat()[0];
      const target    = _.firstWord(args);

      // Can hit combatant with no args, if in combat.
      // Otherwise looks for target npc in room.

      if (combatant && !target) {
        return siphonTarget(combatant);
      }

      if (target) {
        const room = player.getRoom(rooms);
        const npc  = CommandUtil.findNpcInRoom(npcs, target, room, player, true);
        if (npc) { return siphonTarget(npc); }
      }

      return player.say('<magenta>You find no one to siphon from.</magenta>');


      function siphonTarget(target) {

        if (!player.hasEnergy(5, items)) {
          return player.say('<magenta>You will need to rest first.</magenta>');
        }

        const coolingDown = player.getEffects('siphoning');

        if (coolingDown) {
          return player.warn('You must wait before doing that again.');
        }

        const targetHealth = target.getAttribute('health');
        const siphoned     = Math.min(targetHealth / 10, player.getAttribute('level') * 5);
        target.setAttribute('health', targetHealth - siphoned);

        const healed = Math.min(player.getAttribute('max_health'),
                                player.getAttribute('health') + siphoned);

        player.setAttribute('health', healed);
        deductSanity(player, siphoned);

        util.log(player.getName() + ' drains a ' + target.getShortDesc('en') + ' for ' + siphoned);

        const duration = (61 - player.getAttribute('level')) * 1000;
        const cost     = Math.ceil(siphoned / player.getAttribute('level'));
        player.addEffect('siphoning', {
          type: 'willpower_cooldown',
          name: 'Using siphon',
          duration,
          cost
        });
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

   activate(player, args, rooms, npcs, players) {
      const cooldownNotOver = player.getEffects('secondwind');

      if (cooldownNotOver) {
        return player.warn("Your heart would surely explode. You must wait.");
      }

      deductSanity(player, 15);
      player.setAttribute('energy', player.getRawAttribute('max_energy'));

      const modifier = Math.ceil(player.getAttribute('level') / 10) + 1;
      player.combat.addSpeedMod({
        name: 'secondwind',
        effect: speed => speed * modifier
      });

      const duration = player.getAttribute('level') * 2000;

      player.addEffect('secondwind', {
        type: 'haste',
        name: 'Secondwind',
        duration,
        activate() {
          player.say('<magenta>You feel a fell energy coursing through your veins.</magenta>')
        },

        deactivate() {
          player.combat.removeSpeedMod('secondwind');

          player.addEffect('secondwind hangover', {
            duration: duration * 4,
            name: 'Recovering from second wind',
            type: 'slow',

            activate() {
              player.combat.addSpeedMod({
                name: 'secondwind hangover',
                effect: speed => speed * .80
              });
              player.say('<magenta>Your heartbeat is erratic...</magenta>');
            },

            deactivate() {
              player.combat.removeSpeedMod('secondwind hangover');
              player.say('<magenta>You feel normal again.</magenta>');
            },
          });
        },

      });

    },
  },

  regeneration: {
    type: 'active',
    cost: 1,
    prereqs: {
      'stamina':    4,
      'quickness':  2,
      'willpower':  3,
      'cleverness': 2,
      'level':      8,
    },
    id: 'regeneration',
    name: 'Regeneration',
    description: 'Restore your own broken tissues.',
    activate(player, args, rooms, npcs, players) {
      const cooldownNotOver = player.getEffects('regeneration cooldown') || player.getEffects('regeneration');

      if (cooldownNotOver) {
        return player.say("You must wait before doing that again.");
      }

      const duration = 30  * 1000;
      const cooldown = 120 * 1000;
      const interval = 2;
      const bonus    = 10 + Math.ceil(player.getAttribute('level') + player.getAttribute('willpower') / 2.5);

      player.addEffect('regeneration', {
        bonus,
        interval,
        duration,

        type:      'regen',
        attribute: 'health',
        name: 'Regeneration',
        desc: 'Your body is mending itself at an unnatural pace.',
        isFeat:     true,

        deactivate() {
          util.log(player.getName() + ' regen is deactivated.');
          player.addEffect('regeneration cooldown', {
            name: 'Recovery from regeneration',
            type: 'weakness',
            duration: cooldown
          });
          player.say('<green>You feel a dull ache as your body stops stitching itself back together.</green>')
        },
      });

      player.say("<blue>You feel your own flesh mending itself.</blue>");

      deductSanity(player, 25);

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
