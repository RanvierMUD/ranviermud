var LevelUtils = require("../../../src/levels").LevelUtils;
var initiate_combat = require("../../../src/rtcombat").initiate_combat;

exports.listeners = {
  playerEnter: function(l10n) {
    var callback = function(success) {};
    return function(room, rooms, player, players, npc, npcs) {
      initiate_combat(l10n, this, player, room, npcs, players, callback);
    }
  }
};