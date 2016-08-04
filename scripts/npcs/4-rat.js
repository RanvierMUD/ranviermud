'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;
const util = require('util');

exports.listeners = {

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Random.inRange(1, 5);
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
    return (room, player, players, item) => {
      const rand = Random.inRange(1, 5);
      if (rand === 3) {
        const itemDesc = item.getShortDesc();
        const msg = '<bold>The rat sniffs at the' + itemDesc +'</bold>';
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
        'The rat rakes ' + player.combat.getDesc() + ' in the ' + hitLocation + ' with its jagged claws.',
        'The rat bites ' + player.combat.getDesc() + '\'s ' + hitLocation + ' and refuses to let go.',
        'The rat screeches at ' + player.combat.getDesc() + ' and sinks its fangs in their' + hitLocation + '.'
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },

  damaged: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);

      const secondPartyMessage = [
        'The rat screeches in pain, a bloody foam spraying from its maw.',
        'A gash opens across the feral rat\'s matted fur.',
        'The rabid rodent is knocked back by the blow, a ball of furry fury.',
        'The rat\'s ' + hitLocation + ' tears under the force of the blow.'
      ];
      const thirdPartyMessage = [
        'The rat screeches in pain as its ' + hitLocation + ' crumples.',
        'Foaming at the maw, the rat is gashed by ' + player.combat.getDesc() + '\'s attack.',
        'The fierce rat is bashed away by ' + player.combat.getDesc() + '.',
        'Blood sprays across the ground as the feral rat\'s ' + hitLocation + ' is sundered.'
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
        'The rat scurries away from ' + player.combat.getDesc()'\'s attack.',
        player.combat.getDesc() + '\'s attack hits only the rat\'s fur.',
        'The fierce rat leaps past ' + player.combat.getDesc() + ' and they whiff.',
      ];

      Broadcast.consistentMessage(toRoom, { secondPartyMessage, thirdPartyMessage });
    }
  },


};
