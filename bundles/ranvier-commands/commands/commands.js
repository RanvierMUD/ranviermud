'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    aliases: ['channels'],
    command: (state) => (args, player) => {

      // print standard commands
      Broadcast.sayAt(player, "<bold><white>                  Commands</bold></white>");
      Broadcast.sayAt(player, "<bold><white>===============================================</bold></white>");

      let i = 0;
      for (let [ name, command ] of state.CommandManager.commands) {
        if (player.role < command.requiredRole) {
          continue;
        }

        Broadcast.at(player, sprintf("%-20s", name));
        if (++i % 3 === 0) {
          Broadcast.sayAt(player);
        }
      }
      // append another line if need be
      if ((i - 1) % 3 !== 0) {
        Broadcast.sayAt(player);
      }

      // channels
      Broadcast.sayAt(player);
      Broadcast.sayAt(player, "<bold><white>                  Channels</bold></white>");
      Broadcast.sayAt(player, "<bold><white>===============================================</bold></white>");

      i = 0;
      for (let [ name ] of state.ChannelManager.channels) {
        Broadcast.at(player, sprintf("%-20s", name));
        if (++i % 3 === 0) {
          Broadcast.sayAt(player, '');
        }
      }
      
      // end with a line break
      Broadcast.sayAt(player, '');
    }
  };
};
