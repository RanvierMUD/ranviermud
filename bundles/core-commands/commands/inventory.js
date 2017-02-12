'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    command : (state) => (args, player) => {
      if (!player.inventory || !player.inventory.size) {
        return Broadcast.sayAt(player, "You aren't carrying anything.");
      }

      Broadcast.sayAt(player, "You are carrying:");

      // TODO: Implement grouping
      for (const [ uuid, item ] of player.inventory) {
        Broadcast.sayAt(player, item.name);
      }
    }
  };
};

