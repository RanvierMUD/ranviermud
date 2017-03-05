'use strict';

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

    this.items.delete(item);
  }

  tickAll() {
    for (const item of this.items) {
      item.emit('updateTick');
    }
  }
}

module.exports = ItemManager;
