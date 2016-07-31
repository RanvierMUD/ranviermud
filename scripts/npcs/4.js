'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;
const util = require('util');

exports.listeners = {

  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Math.floor(Math.random() * 5 + 1);
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
      const rand = Math.floor(Math.random() * 5 + 1);
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

  hit: function(l10n) {
    return function(room, player, players, hitLocation, damage) {
      const toRoom = Broadcast.toRoom(room, this, player, players);
      util.log('HIT EMIT!!!!!!');
      const secondPartyMessage = Random.fromArray([
        'The rat\'s claws rake your ' + hitLocation + ', drawing lines of blood.',
        'The rat gnaws your ' + hitLocation + '.',
        'Foaming at the mouth, the rat sinks its fangs into your ' + hitLocation + '.'
      ]);
      const thirdPartyMessage = Random.fromArray([
        'The rat rakes ' + player.combat.getDesc() + ' in the ' + hitLocation + ' with its jagged claws.',
        'The rat bites ' + player.combat.getDesc() + '\'s ' + hitLocation + ' and refuses to let go.',
        'The rat screeches at ' + player.combat.getDesc() + ' and sinks its fangs in.'
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
        'The rat screeches in pain, a bloody foam spraying from its maw.',
        'A gash opens across the feral rat\'s matted fur.',
        'The rabid rodent is knocked back by the blow, a ball of furry fury.',
        'The rat\'s ' + hitLocation + ' tears under the force of the blow.'
      ]);
      const thirdPartyMessage = Random.fromArray([
        'The rat screeches in pain as its ' + hitLocation + ' crumples.',
        'Foaming at the maw, the rat recoils ' + player.combat.getDesc() + '\'s blow.',
        'Blood sprays across the ground as the feral rat\'s ' + hitLocation + ' is sundered.'
      ]);
      toRoom({
          secondPartyMessage,
          thirdPartyMessage,
      });
    }
  },

};
