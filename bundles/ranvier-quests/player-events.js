'use strict';

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      questStart: state => function (quest) {
        B.sayAt(this, `\r\n<bold><yellow>Quest Started: ${quest.config.title}!</yellow></bold>`);
        if (quest.config.desc) {
          B.sayAt(this, B.line(80));
          B.sayAt(this, `<bold><yellow>${quest.config.desc}</yellow></bold>`, 80);
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
      }
    }
  };
};

