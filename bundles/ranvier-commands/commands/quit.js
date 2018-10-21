'use strict';

const { Broadcast } = require('ranvier');

module.exports = {
  usage: 'quit',
  command: (state) => (args, player) => {
    if (player.isInCombat()) {
      return Broadcast.sayAt(player, "You're too busy fighting for your life!");
    }

    player.save(() => {
      Broadcast.sayAt(player, "Goodbye!");
      Broadcast.sayAtExcept(player.room, `${player.name} disappears.`, player);
      player.socket.emit('close');
    });
  }
};
