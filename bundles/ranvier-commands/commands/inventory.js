'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'inventory',
    command : (state) => (args, player) => {
      if (!player.inventory || !player.inventory.size) {
        return Broadcast.sayAt(player, "You aren't carrying anything.");
      }

      Broadcast.at(player, "You are carrying");
      if (player.inventory.getMax() < Infinity) {
        Broadcast.at(player, ` ${player.inventory.size}/${player.inventory.getMax()}`);
      }
      Broadcast.sayAt(player, ':');

      // TODO: Implement grouping
      for (const [, item ] of player.inventory) {
        Broadcast.sayAt(player, item.display);
      }
    }
  };
};
