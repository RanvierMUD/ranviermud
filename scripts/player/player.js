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

  experience(l10n) {
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

  tick(l10n) {
    return function() {
      Effects.evaluateEffects(this, 'tick');
    }
  },

  //TODO: Extract all stuff for determining stat gain into level utils.

  level(l10n) {
    return function() {
      const name = this.getName();
      const newLevel = this.getAttribute('level') + 1;
      const healthGain = Math.ceil(this.getAttribute('max_health') * 1.10);
      const energyGain = Math.ceil(this.getAttribute('max_energy') * 1.10);

      util.log(name + ' gained health ' + healthGain);
      util.log(name + ' gained energy ' + energyGain);
      util.log(name + ' is now level ' + newLevel);

      this.sayL10n(l10n, 'LEVELUP');

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
        this.say('<blue>You have gained ' + attr + '.</blue>');
      }
    }
  },

  //TODO: Permadeath, add it.
  die: function(l10n) {
    return function() {
      const startLocation = 1;
      const playerExp = this.getAttribute('experience');
      const experiencePenalty = playerExp - Math.ceil((playerExp * 0.10));

      util.log(this.getName() + ' died.');

      this.setLocation(startLocation);
      this.emit('regen');
      this.setAttribute('experience', experiencePenalty);
    }
  },

  deathblow: function(l10n) {
    return function (room, attacker, defender, players, hitLocation) {
      players.eachIf(
        p => p.getLocation() === defender.getLocation() && p !== attacker,
        p => p.emit('experience', LevelUtil.mobExp(defender.getAttribute('level')) * .33)
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
