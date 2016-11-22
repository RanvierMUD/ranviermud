'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;
const util = require('util');

exports.listeners = {

  //TODO: Consider modifying this to use dep injection that is more like the commands.
  // So that "globals" are injected instead of l10n at startup, then specific vars are sent via emitters.
  spawn: l10n => {
    return function (room, rooms, players) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const msg = this.getShortDesc('en') + ' skitters out from a dark corner.';
      toRoom({ thirdPartyMessage: msg });
    }
  },

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Random.inRange(1, 10);
      if (rand === 3) {
        const msg = '<bold>The roach waggles its antennae.</bold>';
        const toRoom = Broadcast.toRoom(room, this, player, players);
        toRoom({
          secondPartyMessage: msg,
          thirdPartyMessage: msg
        });
      }
    }
  },

  playerDropItem: l10n => {
    return function(room, rooms, player, players, npc, npcs, item) {
      const rand = Random.inRange(1, 5);
      if (rand === 3) {
        const itemDesc = item.getShortDesc('en');
        const msg = '<bold>The roach scurries over to the ' + itemDesc +'.</bold>';
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
        'The roach\'s pincers nip your ' + hitLocation + '.',
        'The roach bites your ' + hitLocation + ', drawing a pinprick of blood.',
      ];
      const thirdPartyMessage = [
        'The roach\'s pincers nip ' + player.getShortDesc('en') + '\'s ' + hitLocation + '.',
        'The roach bites ' + player.getShortDesc('en') + ' in the ' + hitLocation + ' and a tiny pinprick of blood wells forth.',
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }

  },

  damaged: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const hitInHead = hitLocation === 'head';
      const secondPartyMessage = hitInHead ?
        [
          'The roach chitters as its antennae are bent at an odd angle.',
        ] :
        [
          'The roach\'s chitin splinters and cracks around its ' + hitLocation + '.',
          'The roach hisses as ichor oozes from its wounds.'
        ];
      const thirdPartyMessage = hitInHead ?
        [
          'The roach chitters as ' + player.getShortDesc() + ' bends its antennae at an odd angle.'
        ] :
        [
          'The roach chitters in pain as its ' + hitLocation + ' shatters.',
          'Ichor oozes from the injured roach.'
        ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  missedAttack: function(l10n) {
    return function(room, player, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = [
        'The roach scuttles over your feet harmlessly.',
        'The roach darts in your direction and you step out of the way.'
      ];
      const thirdPartyMessage = [
        'The roach scuttles over ' + player.getShortDesc('en') + "'s feet harmlessly.",
        'The roach darts at ' + player.getShortDesc('en') + ' but they step out of the way effortlessly.'
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  parry: function(l10n) {
    return function (room, plaer, players, hitLocation) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const secondPartyMessage = [
        '<white>The roach\'s abnormally tough chitin deflects your blow!</white>'
      ];
      const thirdPartyMessage = [
        '<white>' + player.getShortDesc('en') + '\'s blow is deflected by the roach\'s thick shell.</white>'
      ];
      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  npcLeave: l10n => {
    return function(room, rooms, players, npcs, dest) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const thirdPartyMessage = Random.fromArray([
        'A cockroach leaves for ' + dest + ', leaving a trail of ooze.',
        'A roach heads to ' + dest + ', antennae jittering.',
        'An oozing coackroach scuttles over to ' + dest + '.'
      ]);
      toRoom({thirdPartyMessage});
    }
  },

  npcEnter: l10n => {
    return function(room, rooms, players, npcs, src) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const thirdPartyMessage = Random.fromArray([
        'A cockroach leaves for ' + src + ', leaving a trail of ooze.',
        'A roach heads to ' + src + ', antennae jittering.',
        'An oozing coackroach scuttles over to ' + src + '.'
      ]);
      toRoom({thirdPartyMessage});
    }
  },

};
