'use strict';
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    player.save(() => {
      util.log("Saving ", player);
      player.say("Saved.");
    });
  };
};
