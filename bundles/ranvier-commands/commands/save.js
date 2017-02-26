'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'save',
    command: state => (args, player) => {
      player.save(() => {
        Broadcast.sayAt(player, "Saved.");
      });
    }
  };
};
