'use strict';
const Skills = require('../src/skills').Skills;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    if (!args) {
      displayTrainingQueue(player);
      return;
    }

    let targetSkill = args.slice(' ')[0].toLowerCase();

    for (let skill of Skills) {
      if (skill.name.toLowerCase() === targetSkill) {
        util.log(player.getName() + ' is training ' + targetSkill);
        return addSkillToQueue(skill, player);
      }
    }

    player.say("Which skill would you like to train next?");
    return false;

  }
}

function displayTrainingQueue(player) {
  player.say(player.getTraining());
}

function addSkillToQueue(skill, player) {
  // DO STUFF
}
