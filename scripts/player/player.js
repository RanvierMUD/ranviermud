'use strict';
//TODO: Refactor into individual files.
var LevelUtil = require('../../src/levels').LevelUtil,
  Skills = require('../../src/skills').Skills,
  CommandUtil = require('../../src/command_util').CommandUtil,
  util = require('util'),
  Commands = require('../../src/commands').Commands,
  Effects = require('../../src/effects').Effects,
  Broadcast = require('../../src/broadcast').Broadcast;

exports.listeners = {

  //// Function wrappers needed to access "this" (Player obj)
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
    return function(cost) {

      // If there is a cost to the emitted action,
      // reduce it based on their athletics skill.
      // Then, subtract it from their energy.
      if (cost) {
        cost = Math.ceil(cost / this.getSkills('athletics'));
        const currentEnergy = this.getAttribute('energy');
        const newEnergy = Math.max(0, currentEnergy - cost);
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

  //TODO: Improve player messaging for this by:
  // not telling them a number
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
    return function() { /*TODO: Emit sanity loss event here if applicable.*/ }
  },

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

      const gainedMutation = newLevel % 2 === 0;

      let mutationPoints = this.getAttribute('mutagens');

      util.log(name + ' is now level ' + newLevel);

      this.sayL10n(l10n, 'LEVELUP');

      if (gainedMutation) {
        this.sayL10n(l10n, 'MUTAGEN_GAIN');
        mutationPoints++;
        this.setAttribute('mutagens', mutationPoints);
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
        const max = 'max_' + attr;
        this.setAttribute(max, healthGain);
        this.setAttribute(attr, this.getAttribute(max));
        this.say('<blue>You have gained ' + attr + '.</blue>');
      }

      if (gainedMutation) { this.say('\n<blue>You may be able to `manifest` new mutations.</blue>'); }
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

  damaged: function(l10n) {
    return function(room, npc, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, npc, players);
      const messageMap = {
        'head': {
          firstPartyMessage: [
            'You wince as the blow smashes into your skull.',
            'You see stars as ' + npc.getShortDesc() + ' wracks your brain for you.'
          ],
          thirdPartyMessage: [
            this.getShortDesc() + 'winces as the blow smashes into their skull.',
            this.getShortDesc() + 'is staggered by ' + npc.getShortDesc() + '\'s blow to the head.'
          ],
        },
        'legs': {
          firstPartyMessage: [
            'You stagger as ' + npc.getShortDesc() + ' nearly knocks your legs out from under you.',
            'Your knees buckle under the force of ' + npc.getShortDesc() + '\'s blow.'
          ],
          thirdPartyMessage: [
            this.getShortDesc() + ' staggers and nearly trips.',
            this.getShortDesc() + '\'s knees buckle.'
          ]
        },
        'default': {
          firstPartyMessage: [
            'Pain tears through your ' + hitLocation + ' as ' + npc.getShortDesc() + ' strikes true.',
          ],
          thirdPartyMessage: [
            this.getShortDesc() + ' takes a hit to the ' + hitLocation,
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
      [ 'You duck out of the way as ' + npc.getShortDesc() + ' goes for your head.' ] :
      [
        'You twist out of the way as ' + npc.getShortDesc() + ' attacks.',
        'You barely get your ' + hitLocation + ' out of the way in time.'
      ];
      const thirdPartyMessage = hitLocation === 'head' ?
      [ this.getShortDesc() + ' ducks under ' + npc.getShortDesc() + '\'s attack.' ] :
      [
        this.getShortDesc() + ' twists out of the way of ' + npc.getShortDesc() + '.',
        this.getShortDesc() + ' nimbly evades ' + npc.getShortDesc() + '.'
      ];
      Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });
    }
  },

  hit: function(l10n) {
    return function (room, defender, players, hitLocation, damageDealt) {
			const toRoom = Broadcast.toRoom(room, this, null, players);

			const firstPartyMessage = [
				'You punch ' + defender.getShortDesc() + ' in the ' + hitLocation + '.'
			].map(msg => '<bold>' + msg + '</bold>');

      const thirdPartyMessage = [
				this.getShortDesc() + ' punches ' + defender.getShortDesc() + '.'
			].map(msg => '<bold>' + msg + '</bold>');

			util.log('======emitting hit thing stuff for punch');

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
        this.getShortDesc() + ' swings and misses.',
        this.getShortDesc() + ' tries to attack ' + npc.getShortDesc() + ' and whiffs.'
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
