'use strict';

const { Broadcast } = require('ranvier');

module.exports = {
  usage: 'save',
  command: state => (args, player) => {
    player.save(() => {
      Broadcast.sayAt(player, "Saved.");
    });
  }
};
