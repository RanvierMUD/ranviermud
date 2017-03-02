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
            destroyItem(state, this);
          } else {
            checkForHalfRotted(this, duration, now);
          }
        } else {
          decayEnd = Date.now() + duration;
        }
      }
    }
  };

  function destroyItem(state, rottedItem) {
    Logger.verbose(`${rottedItem.id} has decayed.`);
    state.ItemManager.remove(rottedItem);

    if (rottedItem.room) {
      rottedItem.room.removeItem(rottedItem);
    }

    if (rottedItem.type === ItemType.CONTAINER) {
      rottedItem.inventory.forEach(item => destroyItem(state, item));
    }

    if (rottedItem.belongsTo) {
      rottedItem.belongsTo.removeItem(this);
    }
  }

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
