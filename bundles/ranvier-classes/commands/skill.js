'use strict';

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    aliases: [ "spell" ],
    command : state => (args, player) => {
      const say = (message, wrapWidth) => B.sayAt(player, message, wrapWidth);

      if (!args.length) {
        return say("What skill or spell do you want to look up? Use 'skills' to view all skills/spells.");
      }

      let skill = state.SkillManager.find(args, true);
      if (!skill) {
        skill = state.SpellManager.find(args, true);
      }

      if (!skill) {
        return say("No such skill.");
      }

      say(`<bold>${skill.name}</bold>`);
      if (skill.resource.cost) {
        say(`<bold>Resource</bold>: ${skill.resource.attribute}, Cost: <bold>${skill.resource.cost}</bold>`);
      }
      if (skill.cooldownLength) {
        say(`Cooldown: <bold>${skill.cooldownLength}</bold> seconds`);
      }
      say(B.line(80));
      say(skill.info(player), 80);
    }
  };
};


