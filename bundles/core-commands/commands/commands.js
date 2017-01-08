'use strict';
const sprintf = require('sprintf').sprintf;
exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    let commands = [];
    let maxlength = 0;
    for (const command in Commands.player_commands) {
      if(command[0] === '_') {
        continue;
      }
      if (command.length > maxlength) {
        maxlength = command.length;
      }
      commands.push(command);
    }

    commands.sort();

    let len = commands.length + 1;
    for (let i = 1; i < len; i++) {
      let endOfColumn = i % 5 === 0;
      player[endOfColumn ? 'say' : 'write'](sprintf('%-' + (maxlength + 1) + 's', commands[i-1]));
    }
  };
};
