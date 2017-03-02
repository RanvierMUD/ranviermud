'use strict';

class Inventory extends Map {
  /**
   * @param {Item} item
   */
  addItem(item) {
    this.set(item.uuid, item);
    item.belongsTo = this;
  }

  /**
   * @param {Item} item
   */
  removeItem(item) {
    this.delete(item.uuid);
    item.belongsTo = null;
  }

  serialize() {
    let data = [];
    for (const [uuid, item] of this) {
      data.push([uuid, item.serialize()]);
    }
    return data;
  }

  /**
   * @param {GameState} state
   */
  hydrate(state) {
    // Item is imported here to prevent circular dependency with Item having an Inventory
    const Item = require('./Item');

    for (const [uuid, def] of this) {
      if (def instanceof Item) {
        continue;
      }

      const area = state.AreaManager.getAreaByReference(def.entityReference);
      let newItem = state.ItemFactory.create(area, def.entityReference);
      newItem.uuid = uuid;
      newItem.hydrate(state, def);
      newItem.belongsTo = this;
      this.set(uuid, newItem);
      state.ItemManager.add(newItem);
    }
  }
}

module.exports = Inventory;
