'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : (state) => (args, player) => {
      if (!player.inventory || !player.inventory.size) {
        return Broadcast.sayAt(player, "You aren't carrying anything.");
      }

      Broadcast.sayAt(player, "You are carrying:");

      // TODO: Implement grouping
      for (const [, item ] of player.inventory) {
        Broadcast.sayAt(player, item.name);
      }
    }
  };
};
