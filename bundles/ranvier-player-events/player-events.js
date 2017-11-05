'use strict';

const sprintf = require('sprintf-js').sprintf;
const LevelUtil = require('../ranvier-lib/lib/LevelUtil');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Config = require(srcPath + 'Config');

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
        const lastCommandTime = this._lastCommandTime || Infinity;
        const timeSinceLastCommand = Date.now() - lastCommandTime;
        const maxIdleTime = (Math.abs(Config.get('maxIdleTime')) * 60000) || Infinity;

        if (timeSinceLastCommand > maxIdleTime) {
          this.save(() => {
            Broadcast.sayAt(this, `You were kicked for being idle for more than ${maxIdleTime / 60000} minutes!`);
            Broadcast.sayAtExcept(this.room, `${this.name} disappears.`, this);
            Logger.log(`Kicked ${this.name} for being idle.`);
            this.socket.emit('close');
          });
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
      },

      /**
       * Handle a player equipping an item with a `stats` property
       * @param {string} slot
       * @param {Item} item
       */
      equip: state => function (slot, item) {
        if (!item.metadata.stats) {
          return;
        }

        const config = {
          name: 'Equip: ' + slot,
          type: 'equip.' + slot
        };

        const effectState = {
          slot,
          stats: item.metadata.stats,
        };

        this.addEffect(state.EffectFactory.create(
          'equip',
          this,
          config,
          effectState
        ));
      }
    }
  };
};
