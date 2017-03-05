'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const PlayerRoles = require(srcPath + 'PlayerRoles');
  const { CommandParser: Parser } = require(srcPath + 'CommandParser');

  return {
    requiredRole: PlayerRoles.ADMIN,
    command: (state) => (args, player) => {
      args = args.trim();

      if (!args.length) {
        return Broadcast.sayAt(player, 'setadmin <player>');
      }

      const target = Parser.parseDot(args, player.room.players);

      if (!target) {
        return Broadcast.sayAt(player, 'They are not here.');
      }

      if (target.role === PlayerRoles.ADMIN) {
        return Broadcast.sayAt(player, 'They are already an administrator.');
      }

      target.role = PlayerRoles.ADMIN;
      Broadcast.sayAt(target, `You have been made an administrator by ${this.name}.`);
      Broadcast.sayAt(player, `${target.name} is now an administrator.`);
    }
  };
};
