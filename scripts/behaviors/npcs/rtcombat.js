'use strict';
const LevelUtils = require("../../../src/levels").LevelUtils;
const initiate_combat = require("../../../src/rtcombat").initiate_combat;

exports.listeners = {
  combat: function(l10n) {
    return function(player, room, players, npcs, rooms, callback) {
      initiate_combat(l10n, this, player, room, npcs, players, rooms, callback);
    }
  }
};
