'use strict';

const Skills = require('../src/skills').Skills;

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const playerSkills = player.getSkills();
    if (!Object.keys(playerSkills).length) {
      return player.say('You current have no skills.');
    }

    // TODO: Print skills
  };
};
