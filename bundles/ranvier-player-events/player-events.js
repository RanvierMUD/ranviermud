'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const LevelUtil = require(srcPath + 'LevelUtil');

  return  {
    listeners: {
      commandQueued: state => function (commandIndex) {
        const command = this.commandQueue.queue[commandIndex];
        const ttr = sprintf('%.1f', this.commandQueue.getTimeTilRun(commandIndex));
        Broadcast.sayAt(this, `<bold><yellow>Executing</yellow> '<white>${command.label}</white>' <yellow>in</yellow> <white>${ttr}</white> <yellow>seconds.</yellow>`);
      },

      updateTick: state => function () {
        if (this.commandQueue.hasPending && this.commandQueue.lagRemaining <= 0) {
          Broadcast.sayAt(this);
          this.commandQueue.execute();
          Broadcast.prompt(this);
        }
      },

      /**
       * Handle player gaining experience
       * @param {number} amount Exp gained
       */
      experience: state => function (amount) {
        Broadcast.sayAt(this, `<blue>You gained <bold>${amount}</bold> experience!</blue>`);

        const totalTnl = LevelUtil.expToLevel(this.level + 1);

        // level up, currently wraps experience if they gain more than needed for multiple levels
        if (this.experience + amount > totalTnl) {
          Broadcast.sayAt(this, '                                   <bold><blue>!Level Up!</blue></bold>');
          Broadcast.sayAt(this, Broadcast.progress(80, 100, "blue"));

          let nextTnl = totalTnl;
          while (this.experience + amount > nextTnl) {
            amount = (this.experience + amount) - nextTnl;
            this.level++;
            this.experience = 0;
            nextTnl = LevelUtil.expToLevel(this.level + 1);
            Broadcast.sayAt(this, `<blue>You are now level <bold>${this.level}</bold>!</blue>`);
            this.emit('level');
          }
        }

        this.experience += amount;

        this.save();
      }
    }
  };
};
