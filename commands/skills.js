'use strict';
const Skills = require('../src/skills').Skills;
const l10n_file = __dirname + '/../l10n/commands/skills.yml';
const l10n = require('../src/l10n')(l10n_file);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const playerSkills = player.getSkills();

    const sortedSkills = Object
      .keys(Skills)
      .reduce((skillCategories, key) => {
        const skill = Skills[key];
        const attrs = [
          'quickness', 'stamina',
          'cleverness', 'willpower'
        ];
        const attr = skill.attribute;

        if (attrs.indexOf(attr) > -1) {
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
  const descs = {
    1: 'Unskilled',
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
