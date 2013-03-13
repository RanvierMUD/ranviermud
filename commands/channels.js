var Channels = require('../src/channels').Channels;

exports.command = function (rooms, items, players, npcs, Commands) {
  return function (args, player) {
    for (var ch in Channels) {
      var channel = Channels[ch];

      player.say("<yellow>" + channel.name + "</yellow>");
      player.write("  ");
      player.say(channel.description);
    };
  };
};
