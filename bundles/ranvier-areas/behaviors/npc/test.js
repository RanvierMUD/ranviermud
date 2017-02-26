'use strict';

const util = require('util');

module.exports = (srcPath) => {

  return  {
    listeners: {
      spawn: state => function () {
        util.log(`${this.name} spawned into room ${this.room.title}`);
      },

      playerEnter: state => function (player) {
        util.log(`${this.name} noticed ${player.name} enter room`);
      },

      playerLeave: state => function (target, destination) {
        util.log(`${target.name} left ${this.room.title} towards ${destination.title}`);
      },

      playerDropItem: state => function(player, item) {
        util.log(`${this.name} noticed ${player.name} dropped ${item.name}`);
      },

      hit: state => function(target, amount) {
        util.log(`${this.name} hit ${target.name} for ${amount}`);
      },

      damaged: state => function (amount) {
        util.log(`${this.name} damaged ${amount}`);
      },

      npcLeave: state => function (target, destination) {
        util.log(`${target.name} left ${this.room.title} towards ${destination.title}`);
      },

      npcEnter: state => function (target) {
        util.log(`${target.name} entered same room as ${this.name}`);
      },
    }
  };
};
