'use strict';

class ItemManager {
  constructor() {
    this.items = new Set();
  }

  add(item) {
    this.items.add(item);
  }

  remove(item) {
    this.items.delete(item);
  }

  /**
   * Check an item against its max load to see if a new item can be added
   * @param {number} itemId
   * @return {boolean}
   */
  checkCanLoad(itemId) {
    var numLoaded = 0;
    let item = null;
    for (item of this.items) {
      if (item.id === itemId) {
        numLoaded++;
      }
    }

    if (item) {
      return item.maxLoad > numLoaded;
    }

    return false;
  }
}

module.exports = ItemManager;
