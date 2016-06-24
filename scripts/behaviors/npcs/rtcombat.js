'use strict';
const LevelUtils = require("../../../src/levels").LevelUtils;
const initCombat = require("../../../src/rtcombat").initCombat;

exports.listeners = {
  combat: function(l10n) {
    return function(player, room, players, npcs, rooms, callback) {
      initCombat(l10n, this, player, room, npcs, players, rooms, callback);
    }
  }
};
