'use strict';
const util = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command: () => {
      return (args, player) => {
        player.save(() => {
          Broadcast.sayAt(player, "Saved.");
        });
      };
    }
  };
};
