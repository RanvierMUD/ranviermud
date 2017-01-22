'use strict';

const util = require('util');

module.exports = (srcPath) => {

  return  {
    listeners: {
      playerEnter: state => function (player) {
        util.log(`ROOM: ${this.title} noticed ${player.name} enter room`);
      },

      playerLeave: state => function (target, destination) {
        util.log(`ROOM: ${target.name} left ${this.title} towards ${destination.title}`);
      },

      npcLeave: state => function (target, destination) {
        util.log(`ROOM: ${target.name} left ${this.title} towards ${destination.title}`);
      },

      npcEnter: state => function (target) {
        util.log(`ROOM: ${target.name} entered ${this.title}`);
      },
    }
  };
}
