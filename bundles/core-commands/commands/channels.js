'use strict';
const Channels = require('../../../src/channels').Channels;

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    for (let ch in Channels) {
      const channel = Channels[ch];

      player.say("<yellow>" + channel.name + "</yellow>");
      player.write("  ");
      player.say("<magenta>" + channel.description + "</magenta>");
    }
  };
};
