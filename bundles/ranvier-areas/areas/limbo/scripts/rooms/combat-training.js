'use strict';

const { Broadcast } = require('ranvier');

module.exports = {
  listeners: {
    playerEnter: state => function (player) {
      const quest = state.QuestFactory.create(state, 'limbo:selfdefense101', player);
      if (player.questTracker.canStart(quest)) {
        player.questTracker.start(quest);
      }
    }
  }
};
