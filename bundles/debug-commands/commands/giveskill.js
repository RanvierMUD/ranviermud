'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const SkillFlag = require(srcPath + 'SkillFlag');

  return {
    command : (state) => (args, player) => {
      if (!args.length) {
        return Broadcast.sayAt(player, 'Give a passive skill. giveskill <name>');
      }

      const skill = state.SkillManager.get(args);
      if (!skill) {
        return Broadcast.sayAt(player, "No such skill.");
      }

      if (!skill.flags.includes(SkillFlag.PASSIVE)) {
        return Broadcast.sayAt(player, "Skill is not passive.");
      }

      skill.activate(player);
    }
  };
};

