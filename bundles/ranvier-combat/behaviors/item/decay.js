'use strict';

module.exports = srcPath => {
  const ItemType = require(srcPath + 'ItemType');
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Player = require(srcPath + 'Player');

  return {
    listeners: {
      updateTick: state => function (config) {
        const now = Date.now();
        let { duration = 60 } = config;
        duration = duration * 1000;
        this.decaysAt = this.decaysAt || now + duration;

        if (now >= this.decaysAt) {
          this.emit('decay');
        } else {
          this.timeUntilDecay = this.decaysAt - now;
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
          this.inventory.forEach(item => destroyItem(state, item));
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
};
