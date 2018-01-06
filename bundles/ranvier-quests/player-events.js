'use strict';

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      questStart: state => function (quest) {
        B.sayAt(this, `\r\n<bold><yellow>Quest Started: ${quest.config.title}!</yellow></bold>`);
        if (quest.config.description) {
          B.sayAt(this, B.line(80));
          B.sayAt(this, `<bold><yellow>${quest.config.description}</yellow></bold>`, 80);
        }
      },

      questProgress: state => function (quest, progress) {
        B.sayAt(this, `\r\n<bold><yellow>${progress.display}</yellow></bold>`);
      },

      questTurnInReady: state => function (quest) {
        B.sayAt(this, `<bold><yellow>${quest.config.title} ready to turn in!</yellow></bold>`);
      },

      questComplete: state => function (quest) {
        B.sayAt(this, `<bold><yellow>Quest Complete: ${quest.config.title}!</yellow></bold>`);

        if (quest.config.completionMessage) {
          B.sayAt(this, B.line(80));
          B.sayAt(this, quest.config.completionMessage);
        }
      },

      /**
       * Player received a quest reward
       * @param {object} reward Reward config _not_ an instance of QuestReward
       */
      questReward: state => function (reward) {
        // do stuff when the player receives a quest reward. Generally the Reward instance
        // will emit an event that will be handled elsewhere and display its own message
        // e.g., 'currency' or 'experience'. But if you want to handle that all in one
        // place instead, or you'd like to show some supplemental message you can do that here
      },
    }
  };
};

