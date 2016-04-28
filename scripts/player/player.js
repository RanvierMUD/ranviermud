var LevelUtil = require('../../src/levels').LevelUtil,
  Skills = require('../../src/skills').Skills,
  CommandUtil = require('../../src/command_util').CommandUtil,
  util = require('util');

exports.listeners = {

  regen: function(l10n) {
    return function(bonus) {
      bonus = bonus || 1;

      var regenInterval = 2000;
      var self = this;
      self.prompt();

      var regen = setInterval(() => {
        var health = self.getAttribute('health');
        var regenerated = Math.floor(Math.random() * self.getAttribute('stamina') + bonus);
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
      // max level 60
      if (this.getAttribute('level') >= 60) {
        return;
      }

      util.log(this.getName() + ' has gained ' + experience + ' XP.');
      this.sayL10n(l10n, 'EXPGAIN', experience);

      var tnl = LevelUtil.expToLevel(this.getAttribute('level')) - this.getAttribute('experience');

      if (experience >= tnl) {
        return this.emit('level');
      }

      this.setAttribute('experience', this.getAttribute('experience') + experience);
    }
  },
  level: function(l10n) {
    return function() {
      var newlevel = this.getAttribute('level') + 1;
      var health_gain = Math.ceil(this.getAttribute('max_health') * 1.10);
      var mPoints = this.getAttribute('mutagens');
      if (newlevel % 2 === 0) mPoints++;

      var name = this.getName();
      util.log(name + ' is now level ' + newlevel);

      this.sayL10n(l10n, 'LEVELUP');
      this.sayL10n(l10n, 'MUTAGEN_GAIN');
      this.setAttribute('level', newlevel);
      this.setAttribute('mutagens', mPoints);
      this.setAttribute('experience', 0);

      // do whatever you want to do here when a player levels up...
      this.setAttribute('max_health', health_gain);
      this.setAttribute('health', this.getAttribute('max_health'));
      util.log(name + ' now has ' + health_gain + ' max health.');
      // Assign any new skills
      //TODO: Add better skill assignment event.

      // var skills = Skills[this.getAttribute('class')];
      // for (var sk in skills) {
      //  var skill = skills[sk];
      //  if (skill.level === this.getAttribute('level')) {
      //    this.addSkill(sk, {
      //      type: skill.type
      //    });
      //    this.sayL10n(l10n, 'NEWSKILL', skill.name);

      //    if (skill.type === 'passive') {
      //      this.useSkill(sk, this);
      //    }
      //  }
      // }
    }
  },

  //TODO: Permadeath, add it.

  die: function(l10n) {
    return function() {
      // they died, move then back to the start... you can do whatever you want instead of this
      this.setLocation(1);
      this.emit('regen');
      util.log(this.getName() + ' died.');
      this.setAttribute('experience', this.getAttribute('experience') - Math.ceil((this.getAttribute('experience') * 0.10)));
    }
  },

  changeTime: function(l10n) {
    return function(wasDaytime, rooms) {
      var playerIsOutside = rooms.getAt(this.getLocation()).biome === 'outdoors';

      if (playerIsOutside) {

        if (wasDaytime) {
          this.sayL10n(l10n, "SUN_SETTING");
          setTimeout(() => { this.sayL10n(l10n, "SUN_SET") }, 5000);

        } else {
          this.sayL10n(l10n, "SUN_RISING");
          setTimeout(() => { this.sayL10n(l10n, "SUN_UP") }, 5000);
        }

      } else if (wasDaytime) {
        this.sayL10n(l10n, "SUN_SETTING_INDOORS");
      } else {
        this.sayL10n(l10n, "SUN_UP_INDOORS");
      }

    }
  }
};
