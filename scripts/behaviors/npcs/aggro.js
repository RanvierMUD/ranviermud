'use strict';
const util = require('util');

exports.listeners = {
  playerEnter: () => {
    return (room, rooms, player, players, npc, npcs, items) => {
      if (player && !player.isInCombat() && !npc.isInCombat()) {
        npc.emit('combat', player, room, players, npcs, rooms, items, () => {});
      }
    }
  },
};
