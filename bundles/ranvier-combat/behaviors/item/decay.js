'use strict';


module.exports = srcPath => {
  const ItemType = require(srcPath + 'ItemType');
  const Logger = require(srcPath + 'Logger');

  let decayStart,
      decayEnd = Infinity;
  return {
    listeners: {
      updateTick: state => function (config) {
        const { duration } = config;
        if (decayStart) {
          Logger.verbose(`${this.name} is decaying...`, {decayStart, decayEnd});
          if (decayEnd < Date.now()) {
            Logger.verbose(`${this.name} is decayed.`, {decayStart, decayEnd});
            state.ItemManager.remove(this);

            if (this.room) {
              this.room.removeItem(this);
            }

            if (this.type === ItemType.CONTAINER) {
              Logger.verbose(`Removing contents...`);
              this.inventory.forEach(item => state.ItemManager.removeItem(item));
            }

          } else {
            if (decayEnd - (duration / 2) < Date.now()) {
              Logger.verbose(`Editing desc of ${this.name} to show decay.`);
              const decayedDescription = " Parts of this have rotted away.";
              if (!this.roomDesc.endsWith(decayedDescription)) {
                this.roomDesc += decayedDescription;
              }
            }
          }
        } else {
          decayStarted = true;
          decayEnd = decayStart + duration;
        }
      }
    }
  };
};
