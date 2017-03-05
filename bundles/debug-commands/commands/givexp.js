'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const PlayerRoles = require(srcPath + 'PlayerRoles');

  return {
    requiredRole: PlayerRoles.ADMIN,
    command: (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'givexp <amount>');
      }

      const amount = parseInt(args, 10);
      if (isNaN(amount) || amount <= 0) {
        return Broadcast.sayAt(player, 'Amount must be > 0');
      }

      player.emit('experience', amount);
    }
  };
};
