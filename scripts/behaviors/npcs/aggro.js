var LevelUtils = require("../../../src/levels").LevelUtils;
var initiate_combat = require("../../../src/rtcombat").initiate_combat;
//TODO: Make more DRY since it is basically a copy/paste of much of the rtcombat behavior...    
exports.listeners = {
  playerEnter: function(l10n) {
    var callback = function(success) {};
    return function(room, rooms, player, players, npc, npcs) {
      initiate_combat(l10n, this, player, room, npcs, callback);
    }
  }
};