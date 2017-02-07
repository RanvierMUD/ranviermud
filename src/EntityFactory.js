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
   * Create the key used by the entities and scripts maps
   * @param {string} areaName
   * @param {number} id
   * @return {string}
   */
  createEntityRef(area, id) {
    return area + ':' + id;
  }

  /**
   * @param {string} entityRef
   * @return {Object}
   */
  getDefinition(entityRef) {
    return this.entities.get(entityRef);
  }

  /**
   * @param {string} entityRef
   * @param {Object} def
   */
  setDefinition(entityRef, def) {
    def.entityReference = entityRef;
    this.entities.set(entityRef, def);
  }

  /**
   * Add an event listener from a script to a specific item
   * @see BehaviorManager::addListener
   * @param {string}   entityRef
   * @param {string}   event
   * @param {Function} listener
   */
  addScriptListener(entityRef, event, listener) {
    this.scripts.addListener(entityRef, event, listener);
  }

  /**
   * Create a new instance of a given npc definition. Resulting npc will not be held or equipped
   * and will _not_ have its default contents. If you want it to also populate its default contents
   * you must manually call `npc.hydrate(state)`
   *
   * @param {Area}   area
   * @param {string} entityRef
   * @param {Class}  Type      Type of entity to instantiate
   * @return {type}
   */
  createByType(area, entityRef, Type) {
    const definition = this.getDefinition(entityRef);
    const entity = new Type(area, definition);

    if (this.scripts.has(entityRef)) {
      this.scripts.get(entityRef).attach(entity);
    }

    return entity;
  }

  create() {
    throw new Error("No type specified for Entity.create");
  }

  /**
   * Clone an existing item. Resulting item will not be held or equipped and will _not_ have its default contents
   * If you want it to also populate its default contents you must manually call `item.hydrate(state)`
   * @param {Item} item
   * @return {Item}
   */
  clone(entity) {
    return this.create(entity.area, entity.entityReference);
  }
  
}

module.exports = EntityFactory;
