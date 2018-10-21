'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'map',
  command: state => (args, player) => {
    const room = player.room;
    if (!room || !room.coordinates) {
      return B.sayAt(player, "You can't see a map in this room.");
    }

    let size = parseInt(args, 10);
    // always make size an even number so the player is centered
    size = isNaN(size) ? 4 : size - (size % 2);
    // monospace fonts, eh?
    let xSize = Math.ceil(size * 2);
    xSize = Math.max(2, xSize - (xSize % 2));

    if (!size || size > 14) {
      size = 1;
    }

    const coords = room.coordinates;
    let map = '.' + ('-'.repeat(xSize * 2 + 1)) + '.\r\n';

    for (var y = coords.y + size; y >= coords.y - size; y--) {
      map += '|';
      for (var x = coords.x - xSize; x <= coords.x + xSize; x++) {
        if (x === coords.x && y === coords.y) {
          map += '<b><yellow>@</yellow></b>';
        } else if (room.area.getRoomAtCoordinates(x, y, coords.z)) {
          const hasUp = room.area.getRoomAtCoordinates(x, y, coords.z + 1);
          const hasDown = room.area.getRoomAtCoordinates(x, y, coords.z - 1);
          if (hasUp && hasDown) {
            map += '%';
          } else if (hasUp) {
            map += '<';
          } else if (hasDown) {
            map += '>';
          } else {
            map += '.';
          }
        } else {
          map += ' ';
        }
      }

      map += '|\r\n';
    }

    map += "'" + ('-'.repeat(xSize * 2 + 1)) + "'";

    B.sayAt(player, map);
  }
};
