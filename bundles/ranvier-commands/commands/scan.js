'use strict';

const { Broadcast: B } = require('ranvier');

/**
 * See brief details of npcs/players in nearby rooms
 */
module.exports = {
  usage: 'scan',
  command: state => (args, player) => {
    for (const exit of player.room.exits) {
      const room = state.RoomManager.getRoom(exit.roomId);

      B.at(player, `(${exit.direction}) ${room.title}`);
      if (room.npcs.size || room.players.size) {
        B.sayAt(player, ':');
      } else {
        B.sayAt(player);
      }

      for (const npc of room.npcs) {
        B.sayAt(player, `  [NPC] ${npc.name}`);
      }
      for (const pc of room.players) {
        B.sayAt(player, `  [NPC] ${pc.name}`);
      }
      B.sayAt(player);
    }
  }
};
