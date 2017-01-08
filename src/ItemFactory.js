'use strict';

const Item = require('./Item');

/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
class ItemFactory {
  constructor() {
    this.items = new Map();
  }

  getDefinition(area, id) {
    const key = area.match(/[a-z\-_]+:\d+/) ? area : (area + ':' + id);
    return this.items.get(key);
  }

  setDefinition(area, id, def) {
    this.items.set(area + ':' + id, def);
  }


  /**
   * Create a new instance of a given item definition. Resulting item will not be held or equipped
   * and will _not_ have its default contents. If you want it to also populate its default contents
   * you must manually call `item.hydrate(state)`
   *
   * @param {Object|string} item Item definition or definition id
   * @return {Item}
   */
  create(area, definition) {
    definition = typeof definition === 'object' ? definition : this.getDefinition(definition);
    const item = new Item(area, definition);
    return item;
  }

  /**
   * Clone an existing item. Resulting item will not be held or equipped and will _not_ have its default contents
   * If you want it to also populate its default contents you must manually call `item.hydrate(state)`
   * @param {Item} item
   * @return {Item}
   */
  clone(item) {
    let data = item.serialize();
    delete data.uuid;
    delete data.inventory;
    data.isHeld = false;
    data.isEquipped = false;

    return new Item(data);
  }
}

module.exports = ItemFactory;
