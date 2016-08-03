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
      const secondPartyMessage = [
        'The enormous serpent wraps itself around your ' + hitLocation + ' and constricts...',
        'The snake clamps its fangs around your ' + hitLocation + ', refusing to let go.',
      ];
      const thirdPartyMessage = [
        'The python wraps itself around ' + player.combat.getDesc() + '\'s ' + hitLocation + '.',
        'The python bites ' + player.combat.getDesc() + ' in the ' + hitLocation + ' and clamps down.',
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  damaged: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = [
        'The snake hisses and recoils.',
        'The serpent\'s scales split around their ' + hitLocation + ' and <red>blood</red> spatters forth.',
        'The python hisses as its scales and bones <bold><yellow>crack.</yellow></bold>'
      ];
      const thirdPartyMessage = [
        'The serpent\'s ' + hitLocation + ' is crushed by ' + player.combat.getDesc() + '.',
        'Hissing furiously, the snake recoils from ' + player.combat.getDesc() + '\'s blow.',
        '<bold><green>Scales</green> and <red>blood</red></bold> fill the air as ' + player.combat.getDesc() + ' strikes the serpent\'s ' + hitLocation + '.'
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  missedAttack: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = [
        'The snake lunges at you and whiffs.',
        'The serpent\'s fangs barely misses your ' + hitLocation + '.',
        'The hungry python tries to constrict around your ' + hitLocation + ', but you break free.'
      ];
      const thirdPartyMessage = [
        'The snake lunges at ' + player.combat.getDesc() + ' and flies past, missing completely.',
        'Hissing furiously, the serpent tries to clamp its fangs around ' + player.combat.getDesc() + '\'s ' + hitLocation + '.',
        'The hungry python tries to constrict ' + player.combat.getDesc() + ', but they break free.'
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  dodge: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = [
        'The snake recoils, out of the way of your strike.',
        'The serpent\'s ' + hitLocation + ' twists out of the path of your attack.',
        'Hissing, the python jerks its' + hitLocation + ' out of the way.'
      ];
      const thirdPartyMessage = [
        'The snake recoils away from ' + player.combat.getDesc() + '.',
        'Hissing furiously, the serpent twists away from ' + player.combat.getDesc() + '\'s  strike.',
        'The hungry python slithers out of ' + player.combat.getDesc() + '\'s reach.'
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  parry: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = [
        'The snake reels, knocking your attack away with its heft.',
      ];
      const thirdPartyMessage = [
        'The snake reels and knocks away ' + player.combat.getDesc() + '\'s attack.',
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  }

};
