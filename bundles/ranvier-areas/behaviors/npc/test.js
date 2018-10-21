'use strict';

const { Logger } = require('ranvier');

module.exports = {
  listeners: {
    spawn: state => function () {
      Logger.log(`${this.name} spawned into room ${this.room.title}`);
    },

    playerEnter: state => function (player) {
      Logger.log(`${this.name} noticed ${player.name} enter room`);
    },

    playerLeave: state => function (target, destination) {
      Logger.log(`${target.name} left ${this.room.title} towards ${destination.title}`);
    },

    playerDropItem: state => function(player, item) {
      Logger.log(`${this.name} noticed ${player.name} dropped ${item.name}`);
    },

    hit: state => function(target, amount) {
      Logger.log(`${this.name} hit ${target.name} for ${amount}`);
    },

    damaged: state => function (amount) {
      Logger.log(`${this.name} damaged ${amount}`);
    },

    npcLeave: state => function (target, destination) {
      Logger.log(`${target.name} left ${this.room.title} towards ${destination.title}`);
    },

    npcEnter: state => function (target) {
      Logger.log(`${target.name} entered same room as ${this.name}`);
    },
  }
};
