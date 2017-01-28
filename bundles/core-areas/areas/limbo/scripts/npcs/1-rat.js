'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const util = require('util');

  return  {
    listeners: {
      spawn: state => function () {
        Broadcast.sayAt(this.room, "A rat scurries into view.");
        util.log(`Spawned rat into Room [${this.room.title}]`);
      },

      playerEnter: state => function (player) {
        Broadcast.sayAt(player, 'A rat hisses as you enter the room.');
      }
    }
  };
}
