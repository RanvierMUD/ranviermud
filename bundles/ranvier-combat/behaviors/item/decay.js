'use strict';

module.exports = srcPath => {
  const ItemType = require(srcPath + 'ItemType');
  const Logger = require(srcPath + 'Logger');

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
            //TODO: Set some kind of metadata.
            checkForHalfRotted(this, duration, now);
          }
        } else {
          decayEnd = Date.now() + duration;
        }
      },

      decay: state => function() {
        Logger.verbose(`${this.id} has decayed.`);
        state.ItemManager.remove(this);

        if (this.room) {
          this.room.removeItem(this);
        }

        if (this.type === ItemType.CONTAINER) {
          this.inventory.forEach(item => destroyItem(state, item));
        }

        if (this.belongsTo) {
          this.belongsTo.removeItem(this);
        }
      }
    }
  };

  //TODO: Just change metadata and the 'look' command.
  function checkForHalfRotted(item, duration, now) {
    const midpoint = decayEnd - (duration / 2);
    if (midpoint <= now) {
      const decayedDescription = " Parts of this have rotted away.";
      if (!item.description.endsWith(decayedDescription)) {
        item.description += decayedDescription;
      }
    }
  }

};
