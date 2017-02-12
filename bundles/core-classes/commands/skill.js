'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    aliases: [ "spell" ],
    command : state => (args, player) => {
      let skill = state.SkillManager.get(args);
      if (!skill) {
        skill = state.SpellManager.get(args);
      }

      if (!skill) {
        return Broadcast.sayAt(player, "No such skill.");
      }

      Broadcast.sayAt(player, `<bold>${skill.name}</bold>`);
      if (skill.resource.cost) {
        Broadcast.sayAt(player, `<bold>Resource</bold>: ${skill.resource.attribute}, Cost: <bold>${skill.resource.cost}</bold>`);
      }
      if (skill.cooldownLength) {
        Broadcast.sayAt(player, `Cooldown: <bold>${skill.cooldownLength}</bold> seconds`);
      }
      Broadcast.sayAt(player, (new Array(80)).join('-'));
      Broadcast.sayAt(player, skill.info(player));
    }
  };
};


