'use strict';

const Broadcast   = require('../../src/broadcast').Broadcast;
const Random      = require('../../src/random').Random;
const CommandUtil = require('../../src/command_util').CommandUtil;
const util = require('util');

exports.listeners = {

  spawn: l10n => {
    return function (room, rooms, players) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const msg = this.getShortDesc('en') + ' appears from the shadows, a pulsating purple light throbbing dully from whence it came.';
      toRoom({ thirdPartyMessage: msg });

      players.eachIf(
        p => CommandUtil.inSameRoom(this, p),
        p => {
          const multiplier = Math.max(10 - p.getAttribute('level'), 2);
          const cost = this.getAttribute('level') * multiplier;
          const reason = 'seeing a horror emerge from the abyss';
          p.emit('sanityLoss', cost, reason);
        }
      )
    }
  },

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Random.inRange(1, 5);
      if (rand === 3) {
        const msg = 'The kazuul\'s maw glistens with spittle as it eyes fresh prey.';
        const toRoom = Broadcast.toRoom(room, this, player, players);
        toRoom({
          secondPartyMessage: msg,
          thirdPartyMessage: msg
        });
      }
    }
  },

  playerDropItem: l10n  => {
    return (room, player) => {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      msg = 'The kazuul croaks, its tongue lolling obscenely.';
      toRoom({
        secondPartyMessage: msg,
        thirdPartyMessage: msg
      });
    }
  },

  hit: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = [
        'The kazuul swings its tentacles, bashing your ' + hitLocation + '.',
        'The kazuul\'s sucker-mouthed hand latches onto your ' + hitLocation + ', gnawing away a patch of flesh.',
        'The kazuul\'s <red>burbling neck-maw</red> <bold>clamps</bold> its fangs into your ' + hitLocation + ', leaving jagged tears.'
      ];
      const thirdPartyMessage = [
        'The kazuul bashes ' + player.getShortDesc('en') + ' with its tentacular suckers.',
        'The kazuul\'s <red>bloody sucker mouths</red> latch onto ' + player.getShortDesc('en') + '\'s ' + hitLocation + '.',
        'The kazuul bites ' + player.getShortDesc('en') + ' in the ' + hitLocation + ' and rends.',
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  damaged: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const spilledGuts = hitLocation === 'torso' && damage > this.getAttribute('health') - 5


      const secondPartyMessage = spilledGuts ?
      [ 'The kazuul\'s <red>intestines</red> spill onto the floor in a steaming heap.' ] :
      [
        'The kazuul croaks.',
        'The eldritch abomination oozes <white>pus</white> from its split ' + hitLocation + '.',
        'Staggering, the kazuul roars, its fanged neck-maw slavering hungrily.'
      ];
      const thirdPartyMessage = spilledGuts ?
      [ 'The kazuul\'s <red>intestines</red> spill onto the floor in a steaming heap.' ] :
      [
        'The kazuul gives a pained croak.',
        '<white>Pus</white> oozes from the kazuul\'s torn ' + hitLocation + '.',
        'Tentacles wave and a <white>roar</white> splits the air as the kazuul staggers under the force of ' + player.getShortDesc('en') + '\'s blow.',
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  parry: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        'The kazuul smacks your attack out of the way with its massive tentacle.',
      ];
      const thirdPartyMessage = [
        'The kazuul smacks ' + player.getShortDesc('en') + '\'s attack out of the way with its furrowed tentacle.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });

    }
  },

  dodge: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        'The abomination\'s body bends in a horrific manner to avoid your attack.',
        'The kazuul leaps backwards, dodging, its knees bending at impossible angles.'
      ];
      const thirdPartyMessage = [
        'The kazuul nearly bends in half to avoid ' + player.getShortDesc('en') + '\'s attack.',
        'The kazuul leaps backwards, dodging ' + player.getShortDesc('en') + ', its knees bending at impossible angles.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });

    }
  },

  missedAttack: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        'The kazuul\'s defiled tentacles swing towards you, but connect only with air.',
        'Croaking, the kazuul lunges at you but falls short.'
      ];
      const thirdPartyMessage = [
        'The kazuul swings its tentacle-mouths at ' + player.getShortDesc('en') + ' but is left hungering.',
        'Croaking, the kazuul attempts to chow on ' + player.getShortDesc('en') + ', but misses.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });

    }
  },

  npcLeave: l10n => {
    return function(room, rooms, players, npcs, dest) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const thirdPartyMessage = Random.fromArray([
        'Tentacles swinging and pulsing, the kazuul lurks onwards to ' + dest + '.',
        'Reality seems to bend around the kazuul as it leaves for ' + dest + '.',
        'The kazuul croaks and staggers off to ' + dest + '.'
      ]);
      toRoom({thirdPartyMessage});
    }
  },

  npcEnter: l10n => {
    return function(room, rooms, players, npcs, src) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const thirdPartyMessage = Random.fromArray([
        'A kazuul lurks in from '+ src + ', tentacles swinging.',
        'A dim violet light pulses from ' + src + ' and a kazuul appears...',
        'A croak echoes from nearby as a kazuul staggers in from ' + src + '.'
      ]);
      toRoom({thirdPartyMessage});
    }
  },

};
