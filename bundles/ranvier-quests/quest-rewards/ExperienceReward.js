'use strict';

const LevelUtil = require('../../ranvier-lib/lib/LevelUtil');

module.exports = srcPath => {
  const QuestReward = require(srcPath + 'QuestReward');
  /**
   * Quest reward that gives experience
   *
   * Config options:
   *   amount: number, default: 0, Either a static amount or a multipler to use for leveledTo
   *   leveledTo: "PLAYER"|"QUEST", default: null, If set scale the amount to either the quest's or player's level
   *
   * Examples:
   *
   *   Gives equivalent to 5 times mob xp for a mob of the quests level
   *     amount: 5
   *     leveledTo: quest
   *
   *   Gives a static 500 xp
   *     amount: 500
   */
  return class ExperienceReward extends QuestReward {
    static reward(quest, config, player) {
      config = Object.assign({
        amount: 0,
        leveledTo: null,
      }, config);

      let amount = config.amount;
      if (config.leveledTo) {
        const level = config.leveledTo === 'PLAYER' ? player.level : quest.config.level;
        amount = LevelUtil.mobExp(level) * amount;
      }

      player.emit('experience', amount);
    }
  };
};
