'use strict';

const { SkillFlag, SkillType } = require('ranvier');

const interval = 2 * 60;
const threshold = 30;
const restorePercent = 50;

/**
 * Basic warrior passive
 */
module.exports = {
  name: 'Second Wind',
  type: SkillType.SKILL,
  flags: [SkillFlag.PASSIVE],
  effect: "skill.secondwind",
  cooldown: interval,

  configureEffect: effect => {
    effect.state = Object.assign(effect.state, {
      threshold: threshold,
      restorePercent: restorePercent,
    });

    return effect;
  },

  info: function (player) {
    return `Once every ${interval / 60} minutes, when dropping below ${threshold} energy, restore ${restorePercent}% of your max energy.`;
  }
};
