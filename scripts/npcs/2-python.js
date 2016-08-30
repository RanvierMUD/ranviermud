'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;
const util = require('util');

exports.listeners = {

  spawn: l10n => {
    return function (room, rooms, players) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const msg = this.getShortDesc('en') + ' slithers out from the shadows.';
      toRoom({ thirdPartyMessage: msg });
    }
  },

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Random.inRange(1, 5);
      if (rand === 3) {
        const msg = '<bold>The serpent uncoils, hissing.</bold>';
        const toRoom = Broadcast.toRoom(room, this, player, players);
        Broadcast.consistentMessage(toRoom, {
          secondPartyMessage: msg,
          thirdPartyMessage: msg
        });
      }
    }
  },

  playerDropItem: l10n  => {
    return (room, rooms, player, players, npc, npcs) => {
      const rand = Random.inRange(1, 5);
      if (rand === 3) {
        const itemDesc = item.getShortDesc('en');
        const msg = '<bold>The python\'s tongue flickers over the ' + itemDesc + '</bold>';
        const toRoom = Broadcast.toRoom(room, this, player, players);
        Broadcast.consistentMessage(toRoom, {
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
        'The python wraps itself around ' + player.getShortDesc('en') + '\'s ' + hitLocation + '.',
        'The python bites ' + player.getShortDesc('en') + ' in the ' + hitLocation + ' and clamps down.',
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
        'The serpent\'s ' + hitLocation + ' is crushed by ' + player.getShortDesc('en') + '.',
        'Hissing furiously, the snake recoils from ' + player.getShortDesc('en') + '\'s blow.',
        '<bold><green>Scales</green> and <red>blood</red></bold> fill the air as ' + player.getShortDesc('en') + ' strikes the serpent\'s ' + hitLocation + '.'
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  missedAttack: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = [
        'The snake lunges at you and whiffs.',
        'The serpent\'s fangs barely miss your ' + hitLocation + '.',
        'The hungry python tries to constrict around your ' + hitLocation + ', but you break free.'
      ];
      const thirdPartyMessage = [
        'The snake lunges at ' + player.getShortDesc('en') + ' and flies past, missing completely.',
        'Tongue darting to and fro, the serpent tries to clamp its fangs around ' + player.getShortDesc('en') + '\'s ' + hitLocation + '.',
        'The hungry python tries to constrict ' + player.getShortDesc('en') + ', but they break free.'
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  dodge: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = [
        'The snake recoils out of the way of your strike.',
        'The serpent\'s ' + hitLocation + ' twists out of the path of your attack.',
        'Hissing, the python jerks its ' + hitLocation + ' out of the way.'
      ];
      const thirdPartyMessage = [
        'The snake recoils away from ' + player.getShortDesc('en') + '.',
        'Hissing furiously, the serpent twists away from ' + player.getShortDesc('en') + '\'s  strike.',
        'The hungry python slithers out of ' + player.getShortDesc('en') + '\'s reach.'
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
        'The snake reels and knocks away ' + player.getShortDesc('en') + '\'s attack.',
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  npcLeave: l10n => {
    return function(room, rooms, players, npcs, dest) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const thirdPartyMessage = Random.fromArray([
        'The python slithers onward to ' + dest + '.',
        'Hissing and swiveling its head, the python leaves for ' + dest + '.'
      ]);
      toRoom({thirdPartyMessage});
    }
  },

  npcEnter: l10n => {
    return function(room, rooms, players, npcs, src) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const thirdPartyMessage = Random.fromArray([
        'The python slithers in from ' + src + '.',
        'Hissing and swiveling its head, the python arrives from ' + src + '.'
      ]);
      toRoom({thirdPartyMessage});
    }
  },

};
