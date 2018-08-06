'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'quit',
    command: (state) => (args, player) => {
      if (player.isInCombat()) {
        return Broadcast.sayAt(player, "Вы слишком заняты, сражаясь!");
      }

      player.save(() => {
        Broadcast.sayAt(player, "До встречи!");
        Broadcast.sayAtExcept(player.room, `${player.name} пропадает.`, player);
        player.socket.emit('close');
      });
    }
  };
};
