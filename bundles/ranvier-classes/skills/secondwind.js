'use strict';

/**
 * Basic warrior passive
 */
module.exports = (srcPath) => {

  const SkillType = require(srcPath + 'SkillType');
  const SkillFlag = require(srcPath + 'SkillFlag');

  const interval = 2 * 60;
  const threshold = 30;
  const restorePercent = 50;

  return {
    name: 'Second Wind',
    type: SkillType.SKILL,
    flags: [SkillFlag.PASSIVE],
    effect: "skill.secondwind",

    configureEffect: effect => {
      effect.state = Object.assign(effect.state, {
        threshold: threshold,
        interval: interval,
        restorePercent: restorePercent,
      });

      return effect;
    },

    info: function (player) {
      return `Once every ${interval / 60} minutes, when dropping below ${threshold} energy, restore ${restorePercent}% of your max energy.`;
    }
  };
};
