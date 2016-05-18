'use strict';
const Skills = require('../src/skills').Skills;
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    if (!args) {
      displayTrainingQueue(player);
      return;
    }

    let targetSkill = args.split(' ')[0].toLowerCase();

    if (targetSkill === 'clear') {
      return player.clearTraining();
    }


    for (let skill in Skills) {
      const skillName = Skills[skill].name.toLowerCase();

      if (skillName === targetSkill) {
        const id = Skills[skill].id;
        const skillCap = 10;

        if (player.getSkills(id) >= skillCap) {
          player.say('You have already mastered ' + skillName + '.');
          return;
        }

        if (player.getTraining(id)) {
          player.say('You are already planning to train ' + skillName + '.');
          return;
        }

        util.log(player.getName() + ' is training ' + targetSkill);
        return addSkillToQueue(Skills[skill], player);
      }
    }

    player.say("You don't have that skill.");
    player.say("Which of your skills would you like to train?");
    for (let skill in Skills) {
      player.write('    ');
      player.say('<yellow>' + Skills[skill].name + '</yellow>');
    }
    return;
  }
}

function displayTrainingQueue(player) {
  const training = player.getTraining();
  const displayMap = {
    'time': 'Hours of training time left',
    'newLevel': 'Hours to train skill for',
    'duration': 'Hours remaining in session'
  }
  for (let skill in training) {
    if (skill in displayMap) {
      player.say(displayMap[skill] + ': ' + training[skill]);
    } else {

      if (skill !== 'beginTraining') {
        player.say('\n<yellow>' + Skills[skill].name + '</yellow>');

        for (let sessionDetail in training[skill]) {
          if (sessionDetail in displayMap) {
            let stat = training[skill][sessionDetail];
            if (sessionDetail === 'duration') {
              stat = Math.ceil(stat / (60 * 60 * 1000));
            }
            player.say(displayMap[sessionDetail] + ': ' + stat)
          }
        }
      }
    }
  }
}

function addSkillToQueue(skill, player) {
  const training = player.getTraining();
  const skills = player.getSkills();

  if (training.time > skills[skill.id]) {
    const cost = skills[skill.id] + 1;

    // Each level of the skill to be trained takes 1 hour of offline 'rest' time.
    const sessionLength = cost * 60 * 60 * 1000;

    const defaultMessage =
      '<blue>You have finished training ' +
      skill.name +
      '.</blue>';

    const trainingSession = {
      skill: skill.name,
      id: skill.id,
      duration: sessionLength,
      newLevel: cost,
      message: skill.trainingMessage || defaultMessage,
    };

    player.setTraining('time', training.time - cost);
    player.setTraining(skill.id, trainingSession);
    player.say(
      'On resting, you will train ' +
      skill.name.toLowerCase() +
      ' for ' + cost + ' hours.'
    );

  } else {
    player.say('You feel like you hit a wall when training ' + skill.name.toLowerCase() + '.');
    player.say('You will need more time to dedicate to training to make any real progress.');
  }
}
