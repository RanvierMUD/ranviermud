'use strict';

const Item = require('./Item');
const BehaviorManager = require('./BehaviorManager');

/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
class ItemFactory {
  constructor() {
    this.items = new Map();
    this.scripts = new BehaviorManager();
  }

  /**
   * @param {string} areaName
   * @param {number} id
   * @return {Object}
   */
  getDefinition(areaName, id) {
    const key = areaName.match(/[a-z\-_]+:\d+/) ? areaName : this._makeItemKey(areaName, id);
    return this.items.get(key);
  }

  /**
   * @param {string} areaName
   * @param {number} id
   * @param {Object} def
   */
  setDefinition(areaName, id, def) {
    this.items.set(this._makeItemKey(areaName, id), def);
  }

  /**
   * Add an event listener from a script to a specific item
   * @see BehaviorManager::addListener
   * @param {string}   areaName
   * @param {number}   id
   * @param {string}   event
   * @param {Function} listener
   */
  addScriptListener(areaName, id, event, listener) {
    this.scripts.addListener(this._makeItemKey(areaName, id), event, listener);
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
    const itemKey = this._makeItemKey(area.name, definition.id);
    const script = this.scripts.has(itemKey) && this.scripts.get(itemKey);
    if (script) {
      script.attach(item);
    }
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

  /**
   * Create the key used by the items and scripts maps
   * @param {string} areaName
   * @param {number} id
   * @return {string}
   */
  _makeItemKey(areaName, id) {
    return areaName + ':' + id;
  }
}

module.exports = ItemFactory;
