'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;
const util = require('util');

exports.listeners = {

  spawn: l10n => {
    return function (room, rooms, players) {
      const toRoom = Broadcast.toRoom(room, this, null, players);
      const msg = this.getShortDesc('en') + ' crawls out from its filthy nest.';
      toRoom({ thirdPartyMessage: msg });
    }
  },

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Random.inRange(1, 15);
      if (rand === 3) {
        const msg = '<bold>The rat chitters.</bold>';
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
        const msg = `<bold>The rat sniffs at the ${itemDesc}.</bold>`;
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

      const secondPartyMessage = [
        'The rat\'s claws rake your ' + hitLocation + ', drawing lines of blood.',
        'The rat gnaws your ' + hitLocation + '.',
        'Foaming at the mouth and screeching, the rat sinks its fangs into your ' + hitLocation + '.'
      ];
      const thirdPartyMessage = [
        'The rat rakes ' + player.getShortDesc('en') + ' in the ' + hitLocation + ' with its jagged claws.',
        'The rat bites ' + player.getShortDesc('en') + '\'s ' + hitLocation + ' and refuses to let go.',
        'The rat screeches at ' + player.getShortDesc('en') + ' and sinks its fangs in their ' + hitLocation + '.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  damaged: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const moderateDamage = damage < this.getAttribute('health') - 1;

      const secondPartyMessage = moderateDamage ?
      [
        'The rat screeches in pain, a bloody foam spraying from its maw.',
        'A gash opens across the feral rat\'s matted fur.',
        'The rabid rodent is knocked back by the blow, a ball of furry fury.',
        'The rat\'s ' + hitLocation + ' tears under the force of the blow.'
      ] :
      [
        'The rat\'s '+ hitLocation + ' is crushed, a matted ball of bloody fur and bones.'
      ];
      const thirdPartyMessage = moderateDamage ?
      [
        'The rat screeches in pain as its ' + hitLocation + ' crumples.',
        'Foaming at the maw, the rat is gashed by ' + player.getShortDesc('en') + '\'s attack.',
        'The fierce rat is bashed away by ' + player.getShortDesc('en') + '.',
        'Blood sprays across the ground as the feral rat\'s ' + hitLocation + ' is sundered.'
      ] :
      [
        'The rat\'s '+ hitLocation + ' is crushed, a matted ball of bloody fur, thanks to ' + player.getShortDesc('en') + '.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  dodge: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        'The rat scurries away from you.',
        'Your attack hits nothing but fur.',
        'The rabid rodent leaps past you as you make your move, and you miss.',
      ];
      const thirdPartyMessage = [
        'The rat scurries away from ' + player.getShortDesc('en') + '\'s attack.',
        player.getShortDesc('en') + '\'s attack hits only the rat\'s fur.',
        'The fierce rat leaps past ' + player.getShortDesc('en') + ' and they whiff.',
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  missedAttack: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        '<yellow>The rat leaps for your ' + hitLocation + ', but flies past in a ball of fur and fangs.</yellow>',
        '<yellow>The rat\'s claws bounce harmlessly off your ' + hitLocation + '.</yellow>',
        '<yellow>The rabid rodent sprays bloody foam on your ' + hitLocation + ' as they try to bite and miss.</yellow>',
      ];
      const thirdPartyMessage = [
        '<yellow>The rat leaps for ' + player.getShortDesc('en') + '\s ' + hitLocation + ', but flies past in a ball of fur and fangs.</yellow>',
        '<yellow>The rat claws uselessly at ' + player.getShortDesc('en') + ', missing.</yellow>',
        '<yellow>The rabid critter sprays bloody foam on ' + player.getShortDesc('en') + ' but fails to do any real damage.</yellow>',
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
