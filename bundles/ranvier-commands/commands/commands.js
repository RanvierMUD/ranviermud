'use strict';

const sprintf = require('sprintf-js').sprintf;
const { Broadcast } = require('ranvier');

function sayAtColumns (source, strings, numCols) {
  //Build a 2D map of strings by col/row
  let col = 0;
  const perCol = Math.ceil(strings.length / numCols);
  let rowCount = 0;
  const colWidth = Math.floor((3 * 20) / numCols);
  const columnedStrings = strings.reduce((map, string, index) => {
    if (rowCount >= perCol) {
      rowCount = 0;
      col++;
    }
    map[col] = map[col] || [];

    if (!map[col]) {
      map.push([]);
    }

    map[col].push(string);
    rowCount++;
    return map;
  }, [])

  col = 0;
  let row = 0;
  let i = 0;
  const said = [];
  while(said.length < strings.length) {
    if (columnedStrings[col] && columnedStrings[col][row]) {
      const string = columnedStrings[col][row];
      said.push(string);
      Broadcast.at(source, sprintf("%-" + colWidth + "s", string));
    }
    i++;


    col++;
    if (col == numCols) {
      Broadcast.sayAt(source);
      col = 0;
      row++;
    }
  }

  // append another line if need be
  if ((col) % numCols !== 0) {
    Broadcast.sayAt(source);
  }
}

module.exports = {
  aliases: ['channels'],
  command: (state) => (args, player) => {

    // print standard commands
    Broadcast.sayAt(player, "<bold><white>                  Commands</bold></white>");
    Broadcast.sayAt(player, "<bold><white>===============================================</bold></white>");

    let commands = [];
    for (let [ name, command ] of state.CommandManager.commands) {
      if (player.role >= command.requiredRole) {
        commands.push(name);
      }
    }

    commands.sort()
    sayAtColumns(player, commands, 4)

    // channels
    Broadcast.sayAt(player);
    Broadcast.sayAt(player, "<bold><white>                  Channels</bold></white>");
    Broadcast.sayAt(player, "<bold><white>===============================================</bold></white>");

    let i = 0;
    let channelCommands = [];
    for (let [ name ] of state.ChannelManager.channels) {
        channelCommands.push(name);
    }

    channelCommands.sort();
    sayAtColumns(player, channelCommands, 4)


    // end with a line break
    Broadcast.sayAt(player, '');
  }
};
