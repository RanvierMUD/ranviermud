'use strict';

const Broadcast = require('../../src/broadcast').Broadcast;
const Random    = require('../../src/random').Random;
const util = require('util');

exports.listeners = {

  spawn: () => {
    return function (room, rooms, players) {
      util.log(`Rat spawned into room ${room.getTitle()}`);
    }
  },

  playerEnter: () => {
    return (room, rooms, player, players, npc) => {
      util.log(`Rat notices player enter room '${player.getName()}'`);
    }
  },

  playerDropItem: ()  => {
    return (room, rooms, player, players, npc, npcs, item) => {
      util(`Rat notices player dropped item '${item.getShortDesc()}'`);
    }
  },

  hit: () => {
    return function(room, player, players, hitLocation, damage) {
      util.log('Rat lands hit');
    }
  },

  damaged: function() {
    return function(room, player, players, hitLocation, damage) {
      util.log('Rat damaged');
    }
  },

  npcLeave: () => {
    return function(room, rooms, players, npcs, dest) {
      util.log('Rat leave room');
    }
  },

  npcEnter: () => {
    return function(room, rooms, players, npcs, src) {
      util.log('Rat enters room');
    }
  },

};
