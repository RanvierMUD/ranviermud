'use strict';

const FetchGoal = require('../../../ranvier-quests/lib/FetchGoal');
const EquipGoal = require('../../../ranvier-quests/lib/EquipGoal');

module.exports = (srcPath) => {
  const LevelUtil = require(srcPath + 'LevelUtil');

  return {
    1: {
      config: {
        title: "Find A Weapon",
        desc: "You're defenseless! Pick up the sword from the chest by typing 'get sword chest' then wield it with `wield sword`.",
        autoComplete: true,
        reward: (quest, player) => {
          player.emit('experience', LevelUtil.mobExp(player.level) * 5);
        }
      },
      goals: [
        {
          type: FetchGoal,
          config: {
            title: 'Retrieved a Sword',
            count: 1,
            item: "limbo:1"
          }
        },
        {
          type: EquipGoal,
          config: {
            title: 'Equipped a Sword',
            slot: 'wield'
          }
        }
      ]
    },

    2: {
      config: {
        title: "One Cheese Please",
        desc: "A rat's squeaks seem to indicate it wants some cheese. ",
        repeatable: true,
        reward: (quest, player) => {
          player.emit('experience', LevelUtil.mobExp(player.level) * 3);
        }
      },
      goals: [
        {
          type: FetchGoal,
          config: {
            title: 'Found Cheese',
            count: 0,
            item: "limbo:2",
            removeItem: true,
          }
        }
      ]
    }
  };
};
