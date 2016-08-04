'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;
const util = require('util');

exports.listeners = {

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Random.inRange(1, 5);
      if (rand === 3) {
        const msg = 'The defiler\'s maw glistens with spittle as it eyes fresh prey.';
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
      msg = 'The defiler croaks, its tongue lolling obscenely.';
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
        'The defiler swings its tentacles, bashing your ' + hitLocation + '.',
        'The defiler\'s sucker-mouthed hand latches onto your ' + hitLocation + ', gnawing away a patch of flesh.',
        'The defiler\'s <red>burbling neck-maw</red> <bold>clamps</bold> its fangs into your ' + hitLocation + ', leaving jagged tears.'
      ];
      const thirdPartyMessage = [
        'The defiler bashes ' + player.combat.getDesc() + ' with its tentacular suckers.',
        'The defiler\'s <red>bloody sucker mouths</red> latch onto ' + player.combat.getDesc() + '\'s ' + hitLocation + '.',
        'The defiler bites ' + player.combat.getDesc() + ' in the ' + hitLocation + ' and rends.',
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  damaged: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const spilledGuts = hitLocation === 'torso' && damage > this.getAttribute('health') - 5


      const secondPartyMessage = spilledGuts ?
      [ 'The defiler\'s <red>intestines</red> spill onto the floor in a steaming heap.' ] :
      [
        'The defiler croaks.',
        'The eldritch abomination oozes <white>pus</white> from its split ' + hitLocation + '.',
        'Staggering, the defiler roars, its fanged neck-maw slavering hungrily.'
      ];
      const thirdPartyMessage = spilledGuts ?
      [ 'The defiler\'s <red>intestines</red> spill onto the floor in a steaming heap.' ] :
      [
        'The defiler gives a pained croak.',
        '<white>Pus</white> oozes from the defiler\'s torn ' + hitLocation + '.',
        'Tentacles wave and a <white>roar</white> splits the air as the defiler staggers under the force of ' + player.combat.getDesc() + '\'s blow.',
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  parry: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        'The defiler smacks your attack out of the way with its massive tentacle.',
      ];
      const thirdPartyMessage = [
        'The defiler smacks ' + player.combat.getDesc() + '\'s attack out of the way with its furrowed tentacle.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });

    }
  },

  dodge: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        'The abomination\'s body bends in a horrific manner to avoid your attack.',
        'The defiler leaps backwards, dodging, its knees bending at impossible angles.'
      ];
      const thirdPartyMessage = [
        'The defiler nearly bends in half to avoid ' + player.combat.getDesc() + '\'s attack.'
        'The defiler leaps backwards, dodging ' + player.combat.getDesc() + ', its knees bending at impossible angles.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });

    }
  },

  missedAttack: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        'The defilers tentacles swing towards you, but connect only with air.',
        'Croaking, the defiler lunges at you but falls short.'
      ];
      const thirdPartyMessage = [
        'The defiler swings its tentacle-mouths at ' + player.combat.getDesc() + ' but is left hungering.'
        'Croaking, the defiler attempts to chow on ' + player.combat.getDesc() + ', but misses.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });

    }
  },

};
