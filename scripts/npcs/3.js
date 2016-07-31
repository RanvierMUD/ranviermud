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
      const secondPartyMessage = Random.fromArray([
        'The defiler swings its tentacles, bashing your ' + hitLocation + '.',
        'The defiler\'s sucker-mouthed hand latches onto your ' + hitLocation + ', gnawing away a patch of flesh.',
        'The defiler\'s <red>burbling neck-maw</red> <bold>clamps</bold> its fangs into your ' + hitLocation + ', leaving jagged tears.'
      ]);
      const thirdPartyMessage = Random.fromArray([
        'The defiler\'s <red>bloody sucker mouths</red> latch onto ' + player.combat.getDesc() + '\'s ' + hitLocation + '.',
        'The defiler bites ' + player.combat.getDesc() + ' in the ' + hitLocation + ' and rends.',
        'The defiler bashes ' + player.combat.getDesc() + ' with its tentacular suckers.'
      ]);
      toRoom({
        secondPartyMessage,
        thirdPartyMessage,
      });

    }
  },

  damaged: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = Random.fromArray([
        'The defiler croaks.',
        'The eldritch abomination oozes pus from its split ' + hitLocation + '.',
        'Staggering, the defiler roars, its fanged neck-maw slavering hungrily.'
      ]);
      const thirdPartyMessage = Random.fromArray([
        'The defiler gives a pained croak.',
        'Tentacles wave furiously as the defiler staggers under the force of ' + player.combat.getDesc() + '\'s blow.',
        'Pus oozes from the defiler\'s torn ' + hitLocation + '.'
      ]);
      toRoom({
          secondPartyMessage,
          thirdPartyMessage,
      });
    }
  },

};
