'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;
const util = require('util');

exports.listeners = {

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Random.inRange(1, 5);
      if (rand === 3) {
        const itemDesc = item.getShortDesc();
        const msg = '<bold>The serpent uncoils, hissing.</bold>';
        const toRoom = Broadcast.toRoom(room, this, player, players);
        toRoom({
          secondPartyMessage: msg,
          thirdPartyMessage: msg
        });
      }
    }
  },

  playerDropItem: l10n  => {
    return (room, player, players, item) => {
      const rand = Random.inRange(1, 5);
      if (rand === 3) {
        const itemDesc = item.getShortDesc();
        const msg = '<bold>The python\'s tongue flickers over the ' + itemDesc + '</bold>';
        const toRoom = Broadcast.toRoom(room, this, player, players);
        toRoom({
          secondPartyMessage: msg,
          thirdPartyMessage: msg
        });
      }
    }
  },

  hit: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = Random.fromArray([
        'The enormous serpent wraps itself around your ' + hitLocation + ' and constricts...',
        'The snake clamps its fangs around your ' + hitLocation + ', refusing to let go.',
      ]);
      const thirdPartyMessage = Random.fromArray([
        'The python wraps itself around ' + player.combat.getDesc() + '\'s ' + hitLocation + '.',
        'The python bites ' + player.combat.getDesc() + ' in the ' + hitLocation + ' and clamps down.',
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
        'The snake hisses and recoils.',
        'The serpent\'s scales split around their ' + hitLocation + ' and <red>blood</red> spatters forth.',
        'The python hisses as its scales and bones <bold><yellow>crack.</yellow></bold>'
      ]);
      const thirdPartyMessage = Random.fromArray([
        'The serpent ' + hitLocation + ' shatters.',
        'Hissing furiously, the snake recoils from ' + player.combat.getDesc() + '.',
        'Ichor oozes from the injured roach.'
      ]);
      toRoom({
          secondPartyMessage,
          thirdPartyMessage,
      });
    }
  },

  missedAttack: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = Random.fromArray([
        'The snake lunges at you and whiffs.',
        'The serpent\'s fangs barely miss you.',
        'The hungry python tries to constrict around you, but you break free.'
      ]);
      const thirdPartyMessage = Random.fromArray([
        'The roach chitters in pain as its ' + hitLocation + ' shatters.',
        'Hissing furiously, the roach rears its pincer-covered maw.',
        'Ichor oozes from the injured roach.'
      ]);
      toRoom({
          secondPartyMessage,
          thirdPartyMessage,
      });
    }
  },

};
