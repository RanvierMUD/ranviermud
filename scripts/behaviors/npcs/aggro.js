const LevelUtils = require("../../../src/levels").LevelUtils;
const initiate_combat = require("../../../src/rtcombat").initiate_combat;

exports.listeners = {
    playerEnter: (l10n) => {
        let callback = success => { /* Do stuff here*/ };
        return function(room, rooms, player, players, npc, npcs) {
            if (!player.isInCombat() && !npc.isInCombat())
                initiate_combat(l10n, this, player, room, npcs, players, rooms, callback);
        }
    }
};
