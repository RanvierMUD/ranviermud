'use strict';

const { Broadcast, PlayerRoles, SkillFlag } = require('ranvier');

module.exports = {
  requiredRole: PlayerRoles.ADMIN,
  command: (state) => (args, player) => {
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
