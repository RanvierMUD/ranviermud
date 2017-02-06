'use strict';

const FetchQuest = require('../../lib/FetchQuest');

module.exports = (srcPath) => {
  const LevelUtil = require(srcPath + 'LevelUtil');

  return {
    1: {
      type: FetchQuest,
      config: {
        title: "Find A Weapon",
        desc: "You're defenseless! Take the shiv from the chest by typing 'get shiv from chest'",
        targetCount: 1,
        targetItem: "limbo:1",
        autoComplete: true,
        reward: (quest, player) => LevelUtil.mobExp(player.level) * 5
      }
    },

    2: {
      type: FetchQuest,
      config: {
        title: "One Cheese Please",
        desc: "A rat has tasked you with finding it some cheese, better get to it.",
        targetCount: 1,
        targetItem: "limbo:2",
        removeItem: true,
        repeatable: true,
        reward: (quest, player) => LevelUtil.mobExp(player.level) * 3
      }
    }
  };
};
