'use strict';

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');
  const SkillFlag = require(srcPath + 'SkillFlag');

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

      say('<b>' + B.center(80, skill.name, 'white', '-') + '</b>');
      if (skill.flags.includes(SkillFlag.PASSIVE)) {
        say('<b>Passive</b>');
      } else {
        say(`<b>Usage</b>: ${skill.id}`);
      }

      if (skill.resource.cost) {
        say(`<b>Cost</b>: <b>${skill.resource.cost}</b> ${skill.resource.attribute}`);
      }

      if (skill.cooldownLength) {
        say(`<b>Cooldown</b>: <b>${skill.cooldownLength}</b> seconds`);
      }
      say(skill.info(player), 80);
      say('<b>' + B.line(80) + '</b>');
    }
  };
};


