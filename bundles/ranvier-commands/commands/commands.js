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

      const numCols = 3;
      let commands = [];
      for (let [ name, command ] of state.CommandManager.commands) {
        if (player.role >= command.requiredRole) {
          commands.push(name);
        }
      }

      commands.sort()

      //Build a 2D map of commands by col/row
      let col = 0;
      let perCol = Math.floor(commands.length / numCols)
      let rowCount = 0
      const columnedCommands = commands.reduce((map, name, index) => {
        if (rowCount > perCol) {
          rowCount = 0
          col++
        }
        map[col] = map[col] || [];
        map[col].push(name);
        rowCount++
        return map;
      }, {})

      let row = -1;
      col = 0;
      for (let i = 0; i < commands.length; i++) {
        col = i % numCols;
        if (col == 0) {
          row++;
        }

        const name = columnedCommands[col][row];
        Broadcast.at(player, sprintf("%-20s", name));

        if ((i + 1) % numCols === 0) {
          Broadcast.sayAt(player);
        }
      }

      // append another line if need be
      if ((col) % numCols !== 0) {
        Broadcast.sayAt(player);
      }

      // channels
      Broadcast.sayAt(player);
      Broadcast.sayAt(player, "<bold><white>                  Channels</bold></white>");
      Broadcast.sayAt(player, "<bold><white>===============================================</bold></white>");

      let i = 0;
      for (let [ name ] of state.ChannelManager.channels) {
        Broadcast.at(player, sprintf("%-20s", name));
        if (++i % numCols === 0) {
          Broadcast.sayAt(player, '');
        }
      }

      // end with a line break
      Broadcast.sayAt(player, '');
    }
  };
};
