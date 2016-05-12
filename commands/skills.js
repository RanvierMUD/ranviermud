'use strict';
const Skills = require('../src/skills').Skills;
const l10n_file = __dirname + '/../l10n/commands/skills.yml';
const l10n = require('../src/l10n')(l10n_file);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    const playerSkills = player.getSkills();

    const sortedSkills = Object.keys(Skills)
      .reduce((accumulated, key) => {
        const skill = Skills[key];
        const attrs = [
          'quickness', 'stamina',
          'cleverness', 'willpower'
        ];

        if (attrs.indexOf(skill.attribute) > -1) {
          if (skill.attribute in accumulated) {
            accumulated[skill.attribute].push(skill);
          } else {
            accumulated[skill.attribute] = [skill];
          }
        } else {
          accumulated.other.push(skill);
        }
        return accumulated;
      }, {'other': []});

    for (let type in sortedSkills){
      if (sortedSkills[type].length) {
        player.say("<bold><cyan>" + type.toUpperCase() + "</bold></cyan>");
        player.say("");
        sortedSkills[type].forEach(skill => {
          player.say("<yellow>" + skill.name + "</yellow>");
          player.write("  ");
          player.say(skill.description);
          player.write("  ");
          player.say(getSkillLevelDesc(playerSkills[skill.id]));
          player.say(" ");
        });
      }
    }

    if (!Object.keys(sortedSkills).length) { player.sayL10n(l10n, 'NO_SKILLS'); }

  };
};

//TODO: Make this more descriptive?
function getSkillLevelDesc(skillLevel) {
  return '<magenta>' + skillLevel + '</magenta>';
}
