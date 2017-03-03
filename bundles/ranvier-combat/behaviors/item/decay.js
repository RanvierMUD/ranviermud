'use strict';

module.exports = srcPath => {
  const ItemType = require(srcPath + 'ItemType');
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Player = require(srcPath + 'Player');

  let decayEnd;

  return {
    listeners: {
      updateTick: state => function (config) {

        let { duration = 60 } = config;
        duration = duration * 1000;
        const now = Date.now();

        if (decayEnd) {
          if (decayEnd < now) {
            this.emit('decay');
          } else {
            this.timeUntilDecay = getTimeUntilDecay(now);
          }
        } else {
          decayEnd = Date.now() + duration;
        }
      },

      decay: state => function (item) {
        Logger.verbose(`${this.id} has decayed.`);
        state.ItemManager.remove(this);

        const { room, type, belongsTo } = this;

        if (room) {
          room.removeItem(this);
          Broadcast.sayAt(room, `${this.name} has rotted away!`);
        }

        if (type === ItemType.CONTAINER && this.inventory) {
          this.inventory.forEach(item => destroyItem(item));
        }

        if (belongsTo) {
          belongsTo.removeItem(this);
          checkForOwner(belongsTo, this);
        }
      }
    }
  };

  function destroyItem(state, itemToDestroy) {
    Logger.verbose(`${itemToDestroy.id} has decayed.`);
    state.ItemManager.remove(itemToDestroy);
    const { room, type } = itemToDestroy;

    if (room) {
      room.removeItem(itemToDestroy);
    }

    if (type === ItemType.CONTAINER) {
      itemToDestroy.inventory.forEach(item => destroyItem(state, item));
    }
  }

  function checkForOwner(owner, item) {
    while (owner) {
      if (owner instanceof Player) {
        Broadcast.sayAt(owner, `Your ${item.name} has rotted away!`);
        break;
      } else {
        owner = owner.belongsTo;
      }
    }
  }

  function getTimeUntilDecay(now) {
    const rotSeconds = Math.round((decayEnd - now) / 1000);
    if (rotSeconds <= 1) {
      return `a hearbeat.`;
    }
    if (rotSeconds < 121) {
      return `${rotSeconds} seconds`;
    }
    const rotMinutes = Math.round(rotSeconds / 60);
    if (rotMinutes < 121) {
      return `${rotMinutes} minutes`;
    }
    const rotHours = Math.round(rotMinutes / 60);
    if (rotHours < 49) {
      return `${rotHours} hours`;
    }
    const rotDays = Math.round(rotHours / 24);
    return `${rotDays} days`;
  }

};
