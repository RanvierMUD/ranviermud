'use strict';

module.exports = () => {
  const Ranvier = require('ranvier');
  const Broadcast = Ranvier.Broadcast;

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
