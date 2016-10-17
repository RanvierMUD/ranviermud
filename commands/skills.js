'use strict';

const util = require('util');

const Skills = require('../src/skills').Skills;
const l10nFile = __dirname + '/../l10n/commands/skills.yml';
const l10n = require('../src/l10n')(l10nFile);
const _ = require('../src/helpers');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const playerSkills = player.getSkills();

    //TODO: Pull out attrs into enum of some kind for reuse?
    //TODO: Refactor for readability by decomposing nested conditionals.
    const sortedSkills = Object
      .keys(Skills)
      .reduce((skillCategories, key) => {
        const skill = Skills[key];
        const attrs = [
          'quickness', 'stamina',
          'cleverness', 'willpower'
        ];
        const attr = skill.attribute;

        if (_.has(attrs, attr)) {
          if (attr in skillCategories) {
            skillCategories[attr].push(skill);
          } else {
            skillCategories[attr] = [skill];
          }
        } else {
          skillCategories.other.push(skill);
        }
        return skillCategories;
      }, {});

    for (let attr in sortedSkills){
      player.say("");
      if (sortedSkills[attr].length) {
        player.say("<bold><cyan>" + attr.toUpperCase() + "</bold></cyan>");
        player.say("");
        sortedSkills[attr].forEach(skill => {
          player.say("<yellow>" + skill.name + "</yellow>");
          player.write(" ")
          player.say(getSkillLevelDesc(playerSkills[skill.id]));
          player.write("  ");
          player.say("<bold>" + skill.description + "</bold>");
          player.write("  ");
          player.say('<bold>Usage: </bold>' + skill.usage);
          player.say(" ");
        });
      }
    }

    if (!Object.keys(sortedSkills).length) { player.sayL10n(l10n, 'NO_SKILLS'); }

  };
};

function getSkillLevelDesc(skillLevel) {
  if (!skillLevel) { return 'Unskilled' }
  const descs = {
    1: 'Sloppy',
    2: 'Novice',
    3: 'Dabbling',
    4: 'Apprentice',
    5: 'Intermediate',
    6: 'Skilled',
    7: 'Professional',
    8: 'Adept',
    9: 'Expert',
    10: 'Master',
  };
  return '<magenta>' + descs[skillLevel] || 'Wizard' + '</magenta>';
}
