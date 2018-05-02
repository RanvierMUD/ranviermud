'use strict';

/**
 * See brief details of npcs/players in nearby rooms
 */
module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');

  return {
    usage: 'scan',
    command: state => (args, player) => {
      if (player.room.exits && player.room.exits.length) {
        for (const exit of player.room.exits) {
          const room = state.RoomManager.getRoom(exit.roomId);
  
          broadcastScan(exit.direction, room);
        }
      } else if (player.room.coordinates) {
        const directions = {
          north: [0, 1, 0],
          south: [0, -1, 0],
          east: [1, 0, 0],
          west: [-1, 0, 0],
          up: [0, 0, 1],
          down: [0, 0, -1],
        };
        const {x, y, z} = player.room.coordinates;
        for (const [direction, coords] of Object.entries(directions)) {
          const [diffX, diffY, diffZ] = coords;
          const room = player.room.area.getRoomAtCoordinates(x + diffX, y + diffY, z + diffZ);
          
          if (!room) continue;

          broadcastScan(direction, room);
        }
      } else {
        B.sayAt(player, 'You scan your surroundings and see... nothing.');
      }

      function broadcastScan(direction, room) {
        B.at(player, `(${direction}) ${room.title}`);
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
};

