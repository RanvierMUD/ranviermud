'use strict';


module.exports = srcPath => {
  const ItemType = require(srcPath + 'ItemType');
  const Logger = require(srcPath + 'Logger');

  let decayStarted,
      decayEnd = Infinity;

  return {
    listeners: {
      updateTick: state => function (config) {
        let { duration = 60 } = config;
        duration = duration * 1000;
        const now = Date.now();

        if (decayStarted) {
          if (decayEnd < now) {
            destroyItem(state, this);
          } else {
            checkForHalfRotted(this, duration, now);
          }
        } else {
          decayStarted = true;
          decayEnd = Date.now() + duration;
        }
      }
    }
  };

  function destroyItem(state, rottedItem) {
    Logger.verbose(`${rottedItem.name} has decayed.`);
    state.ItemManager.remove(rottedItem);

    if (rottedItem.room) {
      rottedItem.room.removeItem(rottedItem);
    }

    if (rottedItem.type === ItemType.CONTAINER) {
      Logger.verbose(`Removing contents...`);
      rottedItem.inventory.forEach(item => state.ItemManager.removeItem(item));
    }
  }

  function checkForHalfRotted(item, duration, now) {
    const midpoint = decayEnd - (duration / 2);
    Logger.log({midpoint, decayEnd, now});
    if (midpoint <= now) {
      const decayedDescription = " Parts of this have rotted away.";
      if (!item.description.endsWith(decayedDescription)) {
        Logger.verbose(`Editing desc of ${item.name} to show decay.`);
        item.description += decayedDescription;
      }
    }
  }

};
