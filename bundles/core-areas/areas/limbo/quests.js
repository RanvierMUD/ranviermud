'use strict';

const FetchQuest = require('../../lib/FetchQuest');

module.exports = (srcPath) => {
  const LevelUtil = require(srcPath + 'LevelUtil');

  return {
    1: {
      type: FetchQuest,
      config: {
        title: "Find a weapon",
        desc: "You're defenseless! Pick up the shiv in the next room.",
        targetCount: 1,
        targetItem: 'limbo:1',
        reward: (quest, player) => LevelUtil.mobExp(player.level) * 5
      }
    }
  }
};
