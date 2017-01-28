'use strict';

const Item = require('./Item');
const BehaviorManager = require('./BehaviorManager');
const EntityFactory = require('./EntityFactory');

/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
class ItemFactory extends EntityFactory {
  /**
   * Create a new instance of a given item definition. Resulting item will not be held or equipped
   * and will _not_ have its default contents. If you want it to also populate its default contents
   * you must manually call `item.hydrate(state)`
   *
   * @param {Object|string} item Item definition or definition id
   * @return {Item}
   */
  create(area, definition) {
    return this.createByType(area, definition, Item);
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
