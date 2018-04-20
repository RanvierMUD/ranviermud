'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  return  {
    listeners: {
      playerEnter: state => function (config, player) {
        let questId;

        if (typeof config === 'string') {
          questId = config;
        } else if (config && typeof config === 'object') {
          questId = config.questId;
        }

        if (!questId.includes(':')) {
          questId = `${this.area.title}:questId`;
        }

        if (!questId) {
          Logger.error(`No quest name configured in ${this.entityReference}`);
          return;
        }

        const quest = state.QuestFactory.create(state, config.questId, player);
        if (player.questTracker.canStart(quest)) {
          player.questTracker.start(quest);
        }
      }
    }
  };
};