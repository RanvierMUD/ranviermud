'use strict';

const ItemType = require('./ItemType');

/**
 * Keep track of all items in game
 */
class ItemManager {
  constructor() {
    this.items = new Set();
  }

  add(item) {
    this.items.add(item);
  }

  remove(item) {
    if (item.room) {
      item.room.removeItem(item);
    }

    if (item.belongsTo) {
      item.belongsTo.removeItem(item);
    }

    if (item.type === ItemType.CONTAINER && item.inventory) {
      item.inventory.forEach(childItem => this.remove(childItem));
    }

    this.items.delete(item);
  }

  /**
   * @fires Item#updateTick
   */
  tickAll() {
    for (const item of this.items) {
      /**
       * @event Item#updateTick
       */
      item.emit('updateTick');
    }
  }
}

module.exports = ItemManager;
