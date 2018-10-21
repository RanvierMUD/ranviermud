'use strict';

const { Broadcast, RandomUtil: Random } = require('ranvier');
const say = Broadcast.sayAt;

module.exports = {
  usage: 'flee [direction]',
  command: state => (direction, player) => {
    if (!player.isInCombat()) {
      return say(player, "You jump at the sight of your own shadow.");
    }

    let possibleRooms = {};
    for (const possibleExit of player.room.exits) {
      possibleRooms[possibleExit.direction] = possibleExit.roomId;
    }

    // TODO: This is in a few places now, there is probably a refactor to be had here
    // but can't be bothered at the moment.
    const coords = player.room.coordinates;
    if (coords) {
      // find exits from coordinates
      const area = player.room.area;
      const directions = {
        north: [0, 1, 0],
        south: [0, -1, 0],
        east: [1, 0, 0],
        west: [-1, 0, 0],
        up: [0, 0, 1],
        down: [0, 0, -1],
      };

      for (const [dir, diff] of Object.entries(directions)) {
        const room = area.getRoomAtCoordinates(coords.x + diff[0], coords.y + diff[1], coords.z + diff[2]);
        if (room) {
          possibleRooms[dir] = room.entityReference;
        }
      }
    }

    let roomId = null;
    if (direction) {
      roomId = possibleRooms[direction];
    } else {
      const entries = Object.entries(possibleRooms);
      if (entries.length) {
        [direction, roomId] = Random.fromArray(Object.entries(possibleRooms));
      }
    }

    const randomRoom = state.RoomManager.getRoom(roomId);

    if (!randomRoom) {
      say(player, "You can't find anywhere to run!");
      return;
    }


    const door = player.room.getDoor(randomRoom) || randomRoom.getDoor(player.room);
    if (randomRoom && door && (door.locked || door.closed)) {
      say(player, "In your panic you run into a closed door!");
      return;
    }

    say(player, "You cowardly flee from the battle!");
    player.removeFromCombat();
    state.CommandManager.get('move').execute(direction, player);
  }
};
