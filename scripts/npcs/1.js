'use strict';

exports.listeners = {

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Math.floor(Math.random() * 5 + 1);
      if (rand === 3) {
        player.sayL10n(l10n, 'PLAYER_ENTER');
      }
    }
  },

  playerDropItem: l10n  => {
    return (room, player) => {
      player.sayL10n(l10n, 'PLAYER_DROP');
    }
  },

  hit: function(l10n) {
    return function(room, player, hitLocation, damage) {
      player.say(Random.fromArray([
        'The roach\'s pincers nip your ' + hitLocation + '.',
        'The roach bites your ' + hitLocation + ', drawing a pinprick of blood.',
      ]));
    }
  },

  damaged: function(l10n) {
    return function(room player, hitLocation, damage) {
      player.say(Random.fromArray([
        'The roach chitters as its antennae are bent at an odd angle.',
        'The roach\'s chitin splinters and cracks around its ' + hitLocation + '.',
        'The roach hisses as ichor oozes from its wounds.'
      ]));
    }
  }
};
