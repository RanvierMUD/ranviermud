'use strict';


module.exports = srcPath => {
  const ItemType = require(srcPath + 'ItemType');
  const Logger = require(srcPath + 'Logger');

  let decayStarted,
      decayEnd = Infinity;

  // TODO: Make items receive updateTick event.
  return {
    listeners: {
      updateTick: state => function (config) {
        Logger.log(config);
        let { duration } = config;
        duration = duration * 1000;
        if (decayStarted) {
          Logger.verbose(`${this.name} is decaying...`, {decayStarted, decayEnd});
          if (decayEnd < Date.now()) {
            Logger.verbose(`${this.name} is decayed.`, {decayStarted, decayEnd});
            state.ItemManager.remove(this);

            if (this.room) {
              this.room.removeItem(this);
            }

            if (this.type === ItemType.CONTAINER) {
              Logger.verbose(`Removing contents...`);
              this.inventory.forEach(item => state.ItemManager.removeItem(item));
            }

          } else {
            if (decayEnd - (duration / 2) <= Date.now()) {
              Logger.verbose(`Editing desc of ${this.name} to show decay.`);
              const decayedDescription = " Parts of this have rotted away.";
              if (!this.roomDesc.endsWith(decayedDescription)) {
                this.roomDesc += decayedDescription;
              }
            }
          }
        } else {
          decayStarted = true;
          decayEnd = Date.now() + duration;
        }
      }
    }
  };
};
