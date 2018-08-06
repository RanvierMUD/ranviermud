'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'сохранить',
	aliases: ['сохранить'],
    command: state => (args, player) => {
      player.save(() => {
        Broadcast.sayAt(player, "Сохранено.");
      });
    }
  };
};
