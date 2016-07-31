'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;

exports.listeners = {

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Math.floor(Math.random() * 5 + 1);
      if (rand === 3) {
        player.say('<bold>The roach waggles its antennae.</bold>');
      }
    }
  },

  playerDropItem: l10n  => {
    return (room, player, players, item) => {
      const rand = Math.floor(Math.random() * 5 + 1);
      if (rand === 3) {
        const itemDesc = item.getShortDesc();
        player.say('<bold>The roach scurries over to the ' + itemDesc +'</bold>');
      }
    }
  },

  hit: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players)

      toRoom({
        secondParty: Random.fromArray([
          'The roach\'s pincers nip your ' + hitLocation + '.',
          'The roach bites your ' + hitLocation + ', drawing a pinprick of blood.',
        ]),
        thirdParty: Random.fromArray([
          'The roach\'s pincers nip ' + player.combat.getDesc() + '\'s ' + hitLocation + '.',
          'The roach bites ' + player.combat.getDesc() + ' in the ' + hitLocation + ' and a tiny pinprick of blood wells forth.',
        ]),
      });

    }
  },

  damaged: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players)
      const secondPartyMessage = Random.fromArray([
        'The roach chitters as its antennae are bent at an odd angle.',
        'The roach\'s chitin splinters and cracks around its ' + hitLocation + '.',
        'The roach hisses as ichor oozes from its wounds.'
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
