'use strict';

const Npc = require('./Npc');
const BehaviorManager = require('./BehaviorManager');

/**
 * Stores definitions of npcs to allow for easy creation/cloning
 * TODO: Refactor shared methods in ItemFactory/MobFactory to a base EntityFactory
 */
class MobFactory {
  constructor() {
    this.npcs = new Map();
    this.scripts = new BehaviorManager();
  }

  /**
   * @param {string} areaName
   * @param {number} id
   * @return {Object}
   */
  getDefinition(areaName, id) {
    const key = areaName.match(/[a-z\-_]+:\d+/) ? areaName : this._makeMobKey(areaName, id);
    return this.npcs.get(key);
  }

  /**
   * @param {string} areaName
   * @param {number} id
   * @param {Object} def
   */
  setDefinition(areaName, id, def) {
    this.npcs.set(this._makeMobKey(areaName, id), def);
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
    this.scripts.addListener(this._makeMobKey(areaName, id), event, listener);
  }

  /**
   * Create a new instance of a given npc definition. Resulting npc will not be held or equipped
   * and will _not_ have its default contents. If you want it to also populate its default contents
   * you must manually call `npc.hydrate(state)`
   *
   * @param {Area}          area
   * @param {Object|string} npc  Npc definition or definition id
   * @return {Npc}
   */
  create(area, definition) {
    definition = typeof definition === 'object' ? definition : this.getDefinition(definition);
    const npc = new Npc(area, definition);
    const mobKey = this._makeMobKey(area.name, definition.id);
    if (this.scripts.has(mobKey)) {
      this.scripts.get(mobKey).attach(npc);
    }
    npc.area = area;
    return npc;
  }

  /**
   * Clone an existing npc. Resulting npc will not be held or equipped and will _not_ have its default contents
   * If you want it to also populate its default contents you must manually call `npc.hydrate(state)`
   * @param {Npc} npc
   * @return {Npc}
   */
  clone(npc) {
    let data = npc.serialize();
    delete data.uuid;
    delete data.inventory;
    data.isHeld = false;
    data.isEquipped = false;

    let newNpc = new Npc(data);
    newNpc.area = npc.area;
  }

  /**
   * Create the key used by the npcs and scripts maps
   * @param {string} areaName
   * @param {number} id
   * @return {string}
   */
  _makeMobKey(area, id) {
    return area + ':' + id;
  }
}

module.exports = MobFactory;
