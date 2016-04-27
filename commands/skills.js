'use strict';
const Skills = require('../src/skills').Skills;
const l10n_file = __dirname + '/../l10n/commands/skills.yml';
const l10n = require('../src/l10n')(l10n_file);

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    /*
    const skills = player.getSkills();

    //FIXME: Probably won't work because skills are borked.
    for (let realm in skills) { // Physical or mental
      player.say("<magenta>" + realm.toUpperCase() + "</magenta>");

      for (let skill of Skills[realm]) {
        player.say("<yellow>" + skill.name + "</yellow>");
        player.write("  ");
        player.sayL10n(l10n, "SKILL_DESC", skill.description);

        if (typeof skill.cooldown !== "undefined") {
          player.write("  ");
          player.sayL10n(l10n, "SKILL_COOLDOWN", skill.cooldown);
        }

        player.say("");
        return;
      }
    }
    */
    player.sayL10n(l10n, "NO_SKILLS");

  };
};
