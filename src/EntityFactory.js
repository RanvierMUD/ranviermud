'use strict';

const Npc = require('./Npc');
const BehaviorManager = require('./BehaviorManager');

/**
 * Stores definitions of entities to allow for easy creation/cloning
 */
class EntityFactory {
  constructor() {
    this.entities = new Map();
    this.scripts = new BehaviorManager();
  }

  /**
   * @param {string} areaName
   * @param {number} id
   * @return {Object}
   */
  getDefinition(areaName, id) {
    const key = areaName.match(/[a-z\-_]+:\d+/) ? areaName : this._makeEntityKey(areaName, id);
    return this.entities.get(key);
  }

  /**
   * @param {string} areaName
   * @param {number} id
   * @param {Object} def
   */
  setDefinition(areaName, id, def) {
    const key = this._makeEntityKey(areaName, id);
    def.globalId = key;
    this.entities.set(key, def);
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
    this.scripts.addListener(this._makeEntityKey(areaName, id), event, listener);
  }

  /**
   * Create a new instance of a given npc definition. Resulting npc will not be held or equipped
   * and will _not_ have its default contents. If you want it to also populate its default contents
   * you must manually call `npc.hydrate(state)`
   *
   * @param {Area}          area
   * @param {Object|string} definition Entity definition or definition id
   * @param {Class}         type       Type of entity to instantiate
   * @return {type}
   */
  createByType(area, definition, type) {
    definition = typeof definition === 'object' ? definition : this.getDefinition(definition);
    const entity = new type(area, definition);
    const entityKey = this._makeEntityKey(area.name, definition.id);
    if (this.scripts.has(entityKey)) {
      this.scripts.get(entityKey).attach(entity);
    }
    return entity;
  }

  clone() {
    throw new Error('Cannot clone a base Entity');
  }

  /**
   * Create the key used by the entities and scripts maps
   * @param {string} areaName
   * @param {number} id
   * @return {string}
   */
  _makeEntityKey(area, id) {
    return area + ':' + id;
  }
}

module.exports = EntityFactory;
