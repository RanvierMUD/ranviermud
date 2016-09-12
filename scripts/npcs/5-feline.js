'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;
const util = require('util');

exports.listeners = {

  spawn: l10n => {
    return function (room, rooms, players) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const msg = this.getShortDesc('en') + ' yawns and stretches, pulling itself up from behind the bar.';
      toRoom({ thirdPartyMessage: msg });
    }
  },

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Random.inRange(1, 15);
      if (rand === 3) {
        const msg = '<bold>The ginger tomcat mewls, doffing his monocle.</bold>';
        const toRoom = Broadcast.toRoom(room, this, player, players);
        toRoom({
          secondPartyMessage: msg,
          thirdPartyMessage: msg
        });
      }
    }
  },

  playerDropItem: l10n  => {
    return (room, rooms, player, players, npc, npcs, item) => {
      const rand = Random.inRange(1, 15);
      if (rand === 3) {
        const itemDesc = item.getShortDesc('en');
        const msg = '<bold>The cat\'s whiskers twitch as he eyes the ' + itemDesc + '.</bold>';
        const toRoom = Broadcast.toRoom(room, this, player, players);
        toRoom({
          secondPartyMessage: msg,
          thirdPartyMessage: msg
        });
      }
    }
  },

  hit: l10n => {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      const playerName = player.getShortDesc('en');

      let secondPartyMessage, thirdPartyMessage;

      //TODO: Extract this to some kind of combat messaging helper?
      switch(hitLocation) {
        case 'head':
          secondPartyMessage = 'The tomcat flies at your face, a ball of fur, his claws raking your eyes.';
          thirdPartyMessage = 'The tomcat flies at '+ playerName + '\'s face, a ball of fur, his claws raking their eyes.';
          break;

        case 'neck':
          secondPartyMessage = 'The ginger cat tears at your throat, screeching.';
          thirdPartyMessage = 'The ginger cat tears at ' + playerName + '\'s throat, screeching.';
          break;

        default:
          secondPartyMessage = [
            'The tomcat\'s claws rake your ' + hitLocation + ', drawing lines of blood.',
            'The cat fiercely nips your ' + hitLocation + '.',
            'A screeching ball of fur, the tomcat sinks its claws into your ' + hitLocation + '.'
          ];
          thirdPartyMessage = [
            'The tomcat rakes ' + playerName + '\'s' + hitLocation + ' with his sharpened claws.',
            'The cat quickly nips ' + playerName + '\'s ' + hitLocation + ' and darts away, an orange flash.',
            'The cat flies through the air at ' + playerName + ' and sinks his claws in their ' + hitLocation + '.'
          ];
          break;
      }

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  damaged: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const moderateDamage = damage < this.getAttribute('health') - 1;

      const secondPartyMessage = moderateDamage ?
      [
        'The cat screeches in anguish.',
        'The tomcat leaps back, to lick his wounds for a second.',
        'The tomcat is knocked back by the blow, his monocle popping loose for a second.',
        'The cat\'s ' + hitLocation + ' is bruised by your strike.'
      ] :
      [
        'The tomcat\'s '+ hitLocation + ' is smashed open, and his blood spatters on the floor.'
      ];
      const thirdPartyMessage = moderateDamage ?
      [
        'The cat screeches in pain as its ' + hitLocation + ' is bruised.',
        'The tomcat retreats after ' + player.getShortDesc('en') + '\'s vicious attack, to lick his wounds.',
        'The tomcat is bashed away by ' + player.getShortDesc('en') + ', and his monocle pops loose.',
        'The tomcat\'s ' + hitLocation + ' is bashed, and begins swelling immediately.'
      ] :
      [
        'The cat\'s '+ hitLocation + ' is smashed to a furry ginger pulp, thanks to ' + player.getShortDesc('en') + '.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  dodge: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        'The cat leaps away from your strike, and bows ironically.',
        'Your attack hits nothing but fur as the cat darts past you.',
        'The tomcat jumps out of the way, and you swear it laughs at you.',
      ];
      const thirdPartyMessage = [
        'The cat leaps away from ' + player.getShortDesc('en') + '\'s attack.',
        player.getShortDesc('en') + '\'s attack hits nothing as the tomcat runs circles around them.',
        'The sassy tomcat jumps away ' + player.getShortDesc('en') + ', causing them to miss his ' + hitLocation + '.',
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  missedAttack: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        '<yellow>The tomcat leaps for your ' + hitLocation + ', but flies past in a blur of claws.</yellow>',
        '<yellow>The tomcat\'s claws miss your ' + hitLocation + '.</yellow>',
        '<yellow>The cat adjusts his monocle after missing your ' + hitLocation + '.</yellow>',
      ];
      const thirdPartyMessage = [
        '<yellow>The tomcat leaps for ' + player.getShortDesc('en') + '\s ' + hitLocation + ', but flies past in a blur of claws.</yellow>',
        '<yellow>The tomcat claws at ' + player.getShortDesc('en') + ' but whiffs.</yellow>',
        '<yellow>The classy cat adjusts his monocle after missing ' + player.getShortDesc('en') + '.</yellow>',
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  npcLeave: l10n => {
    return function(room, rooms, players, npcs, dest) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const thirdPartyMessage = Random.fromArray([
        'Sniffing for crumbs, the rat leaves for ' + dest + '.',
        'Leaving a trail of bloody foam, the rat leaves for ' + dest + '.',
        'The feral rat leaves for ' + dest + ', chittering and growling to itself.',
        'The rat darts into ' + dest + ', whiskers twitching.'
      ]);
      toRoom({thirdPartyMessage});
    }
  },

  npcEnter: l10n => {
    return function(room, rooms, players, npcs, src) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const thirdPartyMessage = Random.fromArray([
        'Sniffing for crumbs, the rat comes from ' + src + '.',
        'Foaming at the mouth, a feral rat crawls in from ' + src + '.',
        'The feral rat skitters in from ' + src + '.',
        'The rat darts in from ' + src + ', whiskers twitching.'
      ]);
      toRoom({thirdPartyMessage});
    }
  },

};
