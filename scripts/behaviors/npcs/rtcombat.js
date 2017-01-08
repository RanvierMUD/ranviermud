'use strict';
const initCombat = require("../../../src/rtcombat").initCombat;

exports.listeners = {
  combat: function() {
    return function(player, room, players, npcs, rooms, items, callback) {
      initCombat(this, player, room, npcs, players, rooms, items, callback);
    }
  }
};
