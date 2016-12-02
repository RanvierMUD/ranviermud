'use strict';
const LevelUtils = require("../../../src/levels").LevelUtils;
const initCombat = require("../../../src/rtcombat").initCombat;
const util = require('util');

exports.listeners = {
  playerEnter: (l10n) => {
    let callback = success => { /* Do stuff here*/ };
    return function (room, rooms, player, players, npc, npcs) {
      if (player && !player.isInCombat() && !npc.isInCombat()) {
        util.log(npc.getShortDesc('en') + ' is on the offensive.');
        initCombat(l10n, this, player, room, npcs, players, rooms, items, callback);
      }
    }
  },

  playerDropItem: (l10n) => {
    let callback = success => { /* Do stuff here*/ };
    return function (room, rooms, player, players, npc, npcs, items) {
      if (!player.isInCombat() && !npc.isInCombat()) {
        util.log(npc.getShortDesc('en') + ' is on the offensive.');
        initCombat(l10n, this, player, room, npcs, players, rooms, items, callback);
      }
    }
  },

  tick: (l10n) => {
    let callback = success => { /* Do stuff here*/ };
    return function (room, rooms, player, players, npc, npcs, items) {
      players.eachIf(
        p => p.getLocation() === npc.getLocation(),
        p => {
          if (!p.isInCombat() && !npc.isInCombat()) {
            util.log(npc.getShortDesc('en') + ' is on the offensive.');
            initCombat(l10n, this, p, room, npcs, players, rooms, items, callback);
          }
        });

    }
  },

};
