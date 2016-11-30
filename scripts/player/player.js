'use strict';
//TODO: Refactor into individual files.
const LevelUtil = require('../../src/levels').LevelUtil,
  Skills = require('../../src/skills').Skills,
  CommandUtil = require('../../src/command_util').CommandUtil,
  CombatUtil = require('../../src/combat_util').CombatUtil,
  util = require('util'),
  Commands = require('../../src/commands').Commands,
  Effects = require('../../src/effects').Effects,
  Broadcast = require('../../src/broadcast').Broadcast;
exports.listeners = {

  //// Function wrappers needed to access "this" (Player obj)


  //TODO: Use this for all sanity loss incidents.
  sanityLoss: function(l10n) {
    return function(cost, reason) {
      reason = reason || 'experiencing terror';
      const currentSanity = this.getAttribute('sanity');
      this.setAttribute('sanity', Math.max(currentSanity - cost, 0));

      //TODO: Different messages for different relative amounts of sanity loss.
      this.say('You feel your sanity slipping after ' + reason + '.');
    }
  },

  regen: function(l10n) {
      return function(bonus) {
        bonus = bonus || this.getSkills('recovery');
        const config = {
          player: this,
          bonus
        };
        this.addEffect('resting', Effects.regen(config));
    }
  },

  meditate: function(l10n) {
    return function(bonus) {
      bonus = bonus || this.getSkills('concentration');
      const config = {
        player: this,
        stat: 'sanity',
        bonus
      };
      this.addEffect('meditating', Effects.regen(config));
    }
  },

  action: function(l10n) {
    let previousEncumbranceState = '';
    return function(cost, items) {

      // If there is a cost to the emitted action,
      // reduce it based on their athletics skill.
      // Then, subtract it from their energy.
      if (cost) {
        const encumbrance = this.getEncumbrance(items);
        const { multiplier, description } = encumbrance;

        if (description !== previousEncumbranceState) {
          if (previousEncumbranceState !== '') {
            this.warn(`Your current encumbrance is ${description}.`);
          }
          previousEncumbranceState = description;
        }
        cost = Math.ceil((cost * multiplier) / this.getSkills('athletics'));

        CombatUtil.setEncumbrancePenalties(this, encumbrance);
        
        const currentEnergy = this.getAttribute('energy');
        const newEnergy     = Math.max(0, currentEnergy - cost);
        this.setAttribute('energy', newEnergy);
      }

      // Finally, end any recovery states and their effects.
      const recovery = ['resting', 'meditating', 'recuperating'];
      recovery.forEach(state => {
        const effect = this.getEffects(state);
        if (effect) {
          util.log(this.getName() + ' ends ' + state);
          effect.deactivate();
          this.removeEffect(state);
        }
      });
    }
  },

  experience: function(l10n) {
    return function(experience, reason) {

      const maxLevel = 60;
      if (this.getAttribute('level') >= maxLevel) {
        return;
      }

      util.log(this.getName() + ' has gained ' + experience + ' XP.');
      const tnl = LevelUtil.expToLevel(this.getAttribute('level')) - this.getAttribute('experience');
      const relativeExp = (experience / tnl) >= .5 ? 'lot' : 'bit';

      this.say("<bold><blue>You have learned a " + relativeExp + " about " + reason + ".</bold></blue>");
      if (experience >= tnl) {
        return this.emit('level');
      }

      this.setAttribute('experience', this.getAttribute('experience') + experience);
    }
  },

  tick: function(l10n) {
    return function() { /*TODO: Emit sanity loss event here if applicable.*/

      /* Autoregen all the things */
      const healthRegen = Math.ceil((this.getAttribute('level') + this.getSkills('recovery')) / 5) - 1;
      const sanityRegen = Math.ceil((this.getAttribute('level') + this.getSkills('concentration')) / 5) - 1;
      const energyRegen = Math.ceil((this.getAttribute('level') + this.getSkills('athletics')) / 2) - 1;

      const maxHealth = this.getAttribute('max_health');
      const maxSanity = this.getAttribute('max_sanity');
      const maxEnergy = this.getAttribute('max_energy');

      this.setAttribute('health', Math.min(this.getAttribute('health') + healthRegen, maxHealth));
      this.setAttribute('sanity', Math.min(this.getAttribute('sanity') + sanityRegen, maxSanity));
      this.setAttribute('energy', Math.min(this.getAttribute('energy') + energyRegen, maxEnergy));
    }
  },

  //TODO: Extract all stuff for determining stat gain into level utils.

  level: function(l10n) {
    return function() {
      const name = this.getName();
      const newLevel = this.getAttribute('level') + 1;
      const healthGain = Math.ceil(this.getAttribute('max_health') * 1.10);
      const energyGain = this.getAttribute('max_energy')
                       + this.getAttribute('stamina')
                       + this.getAttribute('quickness');

      const sanityGain = this.getAttribute('max_sanity')
                       + this.getAttribute('willpower')
                       + this.getAttribute('cleverness');

      util.log(name + ' gained health ' + healthGain);
      util.log(name + ' gained energy ' + energyGain);
      util.log(name + ' gained sanity' + sanityGain);

      util.log(name + ' is now level ' + newLevel);

      this.sayL10n(l10n, 'LEVELUP');

      const mutationPointsEarned = LevelUtil.getMutagenGain(newLevel);

      if (mutationPointsEarned) {
        this.sayL10n(l10n, 'MUTAGEN_GAIN');
        const mutationPoints = this.getAttribute('mutagens');
        this.setAttribute('mutagens', mutationPoints + mutationPointsEarned);
      }

      this.setAttribute('level', newLevel);
      this.setAttribute('experience', 0);
      this.setAttribute('attrPoints', (this.getAttribute('attrPoints') || 0) + 1);

      // Do whatever you want to do here when a player levels up...
      const attrToLevel = {
        'health': healthGain,
        'energy': energyGain,
        'sanity': sanityGain,
      };

      for (const attr in attrToLevel) {
        const gain = attrToLevel[attr];
        const max = 'max_' + attr;
        this.setAttribute(max, gain);
        this.setAttribute(attr, this.getAttribute(max));
        this.say('<blue>You have gained ' + attr + '.</blue>');
      }

      if (mutationPointsEarned) { this.say('\n<blue>You may be able to `manifest` new mutations.</blue>'); }
      this.say('<blue>You may boost your stamina, quickness, cleverness, or willpower.</blue>');

      // Add points for skills
      const skillGain = LevelUtil.getTrainingTime(newLevel);
      const newTrainingTime = this.getTraining('time') + skillGain;
      util.log(name + ' can train x', newTrainingTime);
      this.setTraining('time', newTrainingTime);
      this.say('<cyan>You may train your skills for ' + newTrainingTime + ' hours.</cyan>')
    }
  },

  //TODO: Permadeath, add it.
  die: function(l10n) {
    return function() {
      const startLocation = 1;
      const playerExp = this.getAttribute('experience');
      const experiencePenalty = playerExp - Math.ceil((playerExp * 0.10));

      util.log(this.getName() + ' died.');
      Commands.player_commands.remove('all', this, true);
      Commands.player_commands.drop('all', this, true);

      this.setLocation(startLocation);
      this.emit('regen');
      this.setAttribute('experience', experiencePenalty);
    }
  },

  deathblow: function(l10n) {
    return function (room, attacker, defender, players, hitLocation) {
      players.eachIf(
        p => p.getLocation() === defender.getLocation() && p !== attacker,
        p => p.emit('experience', LevelUtil.mobExp(defender.getAttribute('level')) * .33, 'dying')
      );
    }
  },

  damaged: function(l10n) {
    return function(room, npc, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, npc, players);
      const messageMap = {
        'head': {
          firstPartyMessage: [
            'You wince as the blow smashes into your skull.',
            'You see stars as ' + npc.getShortDesc('en') + ' wracks your brain for you.'
          ],
          thirdPartyMessage: [
            this.getShortDesc('en') + ' winces as the blow smashes into their skull.',
            this.getShortDesc('en') + ' is staggered by ' + npc.getShortDesc('en') + '\'s blow to the head.'
          ],
        },
        'legs': {
          firstPartyMessage: [
            'You stagger as ' + npc.getShortDesc('en') + ' nearly knocks your legs out from under you.',
            'Your knees buckle under the force of ' + npc.getShortDesc('en') + '\'s blow.'
          ],
          thirdPartyMessage: [
            this.getShortDesc('en') + ' staggers and nearly trips.',
            this.getShortDesc('en') + '\'s knees buckle.'
          ]
        },
        'default': {
          firstPartyMessage: [
            'Pain tears through your ' + hitLocation + ' as ' + npc.getShortDesc('en') + ' strikes true.',
          ],
          thirdPartyMessage: [
            this.getShortDesc('en') + ' takes a hit to the ' + hitLocation + '.',
          ],
        }
      };

      const getMessage = which => messageMap[hitLocation] ? messageMap[hitLocation][which] : messageMap.default[which];
      const firstPartyMessage = getMessage('firstPartyMessage');
      const thirdPartyMessage = getMessage('thirdPartyMessage');
      Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });
    }
  },

  dodge: function(l10n) {
    return function(room, npc, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, npc, players);

      const firstPartyMessage = hitLocation === 'head' ?
      [ 'You duck out of the way as ' + npc.getShortDesc('en') + ' goes for your head.' ] :
      [
        'You twist out of the way as ' + npc.getShortDesc('en') + ' attacks.',
        'You barely get your ' + hitLocation + ' out of the way in time.'
      ];
      const thirdPartyMessage = hitLocation === 'head' ?
      [ this.getShortDesc('en') + ' ducks under ' + npc.getShortDesc('en') + '\'s attack.' ] :
      [
        this.getShortDesc('en') + ' twists out of the way of ' + npc.getShortDesc('en') + '.',
        this.getShortDesc('en') + ' nimbly evades ' + npc.getShortDesc('en') + '.'
      ];
      Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });
    }
  },

  hit: function(l10n) {
    return function (room, defender, players, hitLocation, damageDealt) {
			const toRoom = Broadcast.toRoom(room, this, null, players);

			const firstPartyMessage = [
				'You punch ' + defender.getShortDesc('en') + ' in the ' + hitLocation + '.'
			].map(msg => '<bold>' + msg + '</bold>');

      const thirdPartyMessage = [
				this.getShortDesc('en') + ' punches ' + defender.getShortDesc('en') + '.'
			].map(msg => '<bold>' + msg + '</bold>');

			Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });
		}
  },

  missedAttack: function(l10n) {
    return function(room, npc, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, npc, players);
      const firstPartyMessage = [
        'You swing and miss.',
        'You whiff completely.'
      ];
      const thirdPartyMessage = [
        this.getShortDesc('en') + ' swings and misses.',
        this.getShortDesc('en') + ' tries to attack ' + npc.getShortDesc('en') + ' and whiffs.'
      ];
      Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });
    }
  },

  changeTime: function(l10n) {
    return function (wasDaytime, rooms) {
      const playerIsOutside = rooms.getAt(this.getLocation()).biome === 'outdoors';

      if (playerIsOutside) {
        if (wasDaytime) {
          this.sayL10n(l10n, "SUN_SETTING");
          setTimeout(() => this.sayL10n(l10n, "SUN_SET"), 5000);

        } else {
          this.sayL10n(l10n, "SUN_RISING");
          setTimeout(() => this.sayL10n(l10n, "SUN_UP"), 5000);
        }

      } else if (wasDaytime) {
        this.sayL10n(l10n, "SUN_SETTING_INDOORS");
      } else {
        this.sayL10n(l10n, "SUN_UP_INDOORS");
      }

    }
  }
};
