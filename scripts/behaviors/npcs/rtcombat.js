var LevelUtils = require("../../../src/levels").LevelUtils;
var initiate_combat = require("../../../src/rtcombat").initiate_combat;

exports.listeners = {
  combat: function(l10n) {
    return function(player, room, players, npcs, callback) {
      initiate_combat(l10n, this, player, room, npcs, callback);
    }
  }
};