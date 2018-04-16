'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      playerEnter: state => function (player) {
        const canStart = state.QuestFactory.canStart(player, 'limbo:1');
        if (canStart) {
          const quest = state.QuestFactory.create(state, 'limbo:1', player);
          player.questTracker.start(quest);
        }
      }
    }
  };
};
