'use strict';
var LevelUtil = require('../../src/levels').LevelUtil,
  Skills = require('../../src/skills').Skills,
  CommandUtil = require('../../src/command_util').CommandUtil,
  util = require('util'),
  Commands = require('../../src/commands').Commands,
  Effects = require('../../src/effects').Effects;

exports.listeners = {

  //// Function wrappers needed to access "this" (Player obj)
  regen: function(l10n) {
      return function(bonus) {
        bonus = bonus || player.getSkills('recovery');
        const config = {
          player: this,
          bonus
        };
        this.addEffect('resting', Effects.regen(config));
    }
  },

  meditate: function(l10n) {
    return function(bonus) {
      bonus = bonus || player.getSkills('concentration');
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

      if (cost) {
        const currentEnergy = this.getAttribute('energy');
        const newEnergy = Math.max(0, currentEnergy - cost);
        this.setAttribute('energy', newEnergy);
      }

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
    return function(experience) {

      const maxLevel = 60;
      if (this.getAttribute('level') >= maxLevel) {
        return;
      }

      util.log(this.getName() + ' has gained ' + experience + ' XP.');
      this.sayL10n(l10n, 'EXPGAIN', experience);

      const tnl = LevelUtil.expToLevel(this.getAttribute('level')) - this.getAttribute('experience');

      if (experience >= tnl) {
        return this.emit('level');
      }

      this.setAttribute('experience', this.getAttribute('experience') + experience);
    }
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
        'sanity:': sanityGain,
      };

      for (const attr in attrToLevel) {
        const max = 'max_' + attr;
        this.setAttribute(max, healthGain);
        this.setAttribute(attr, this.getAttribute(max));
        player.say('<blue>You have gained ' + attr + '.</blue>');
      }

      // Add points for skills
      const skillGain = LevelUtil.getTrainingTime(newLevel);
      const newTrainingTime = this.getTraining('time') + skillGain;
      util.log(name + ' can train x', newTrainingTime);
      this.setTraining('time', newTrainingTime);
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
      Commands.player_commands.drop('all', this);

      this.setLocation(startLocation);
      this.emit('regen');
      this.setAttribute('experience', experiencePenalty);
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
