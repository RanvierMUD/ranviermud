'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      playerEnter: state => function (player) {
        const quest = state.QuestFactory.create(state, 'limbo:journeybegins', player);
        if (player.questTracker.canStart(quest)) {
          player.questTracker.start(quest);
        }
      }
    }
  };
};
