'use strict';

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

  experience() {
    return function(experience) {

      const maxLevel = 60;
      if (this.getAttribute('level') >= maxLevel) {
        return;
      }

      util.log(this.getName() + ' has gained ' + experience + ' XP.');
      const tnl = LevelUtil.expToLevel(this.getAttribute('level')) - this.getAttribute('experience');
      const relativeExp = (experience / tnl) >= .5 ? 'lot' : 'bit';

      this.say("<bold><blue>You gain " + experience + " experience.</bold></blue>");
      if (experience >= tnl) {
        return this.emit('level');
      }

      this.setAttribute('experience', this.getAttribute('experience') + experience);
    }
  },

  tick() {
    return function() {
      Effects.evaluateEffects(this, 'tick');
    }
  },

  //TODO: Extract all stuff for determining stat gain into level utils.

  level() {
    return function() {
      const name = this.getName();
      const newLevel = this.getAttribute('level') + 1;
      const healthGain = Math.ceil(this.getAttribute('max_health') * 1.10);
      const energyGain = Math.ceil(this.getAttribute('max_energy') * 1.10);

      util.log(name + ' gained health ' + healthGain);
      util.log(name + ' gained energy ' + energyGain);
      util.log(name + ' is now level ' + newLevel);

      this.say("<bold><blue>You gained a level! You are now level ${newLevel}!</blue></bold>");

      this.setAttribute('level', newLevel);
      this.setAttribute('experience', 0);

      // Do whatever you want to do here when a player levels up...
      const attrToLevel = {
        'health': healthGain,
        'energy': energyGain,
      };

      for (const attr in attrToLevel) {
        const gain = attrToLevel[attr];
        const max = 'max_' + attr;
        this.setAttribute(max, gain);
        this.setAttribute(attr, this.getAttribute(max));
        this.say('  <blue>You have gained ' + attr + '.</blue>');
      }
    }
  },

  die: function() {
    return function() {
      // TODO: Refactor
      util.log(`Player '${this.getName()}' has died`);
      const startLocation = 1;
      const playerExp = this.getAttribute('experience');
      const experiencePenalty = playerExp - Math.ceil((playerExp * 0.10));

      util.log(this.getName() + ' died.');

      this.setLocation(startLocation);
      this.emit('regen');
      this.setAttribute('experience', experiencePenalty);
    }
  },

  deathblow: function() {
    return function (room, attacker, defender, players, hitLocation) {
      util.log(`Player '${this.getName()}' landed a deathblow`);
    }
  },

  damaged: function() {
    return function(room, npc, players, hitLocation) {
      util.log(`Player '${this.getName()}' damaged`);
    }
  },

  changeTime: function() {
    return function (wasDaytime, rooms) {}
  }
};
