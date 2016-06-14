'use strict';
var LevelUtil = require('../../src/levels').LevelUtil,
  Skills = require('../../src/skills').Skills,
  CommandUtil = require('../../src/command_util').CommandUtil,
  util = require('util'),
  Commands = require('../../src/commands').Commands;

exports.listeners = {

  //// Function wrappers needed to access "this" (Player obj)
  //TODO: Do regenHealth, regenSanity, and regenActions
  regen: function(l10n) {
    return function(bonus) {
      bonus = bonus || 1;
      const self = this;
      const regenInterval = 2000;

      const regen = setInterval(() => {
        const health = self.getAttribute('health');
        let regenerated = Math.floor(Math.random() * self.getAttribute('stamina') + bonus);

        regenerated = Math.min(self.getAttribute('max_health'), health + regenerated);
        util.log(self.getName() + ' has regenerated up to ' + regenerated + ' health.');

        self.setAttribute('health', regenerated);
        if (regenerated === self.getAttribute('max_health')) {
          clearInterval(regen);
        }
      }, regenInterval);
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
      this.setAttribute('max_health', healthGain);
      this.setAttribute('health', this.getAttribute('max_health'));
      util.log(name + ' now has ' + healthGain + ' max health.');

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
