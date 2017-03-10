'use strict';

const ItemType = require('./ItemType');

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

  tickAll() {
    for (const item of this.items) {
      item.emit('updateTick');
    }
  }
}

module.exports = ItemManager;
