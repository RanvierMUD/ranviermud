'use strict';

const Npc = require('./Npc');

/**
 * Stores definitions of npcs to allow for easy creation/cloning
 */
class MobFactory {
  constructor() {
    this.npcs = new Map();
  }

  getDefinition(area, id) {
    const key = area.match(/[a-z\-_]+:\d+/) ? area : (area + ':' + id);
    return this.npcs.get(key);
  }

  setDefinition(area, id, def) {
    this.npcs.set(area + ':' + id, def);
  }

  /**
   * Create a new instance of a given npc definition. Resulting npc will not be held or equipped
   * and will _not_ have its default contents. If you want it to also populate its default contents
   * you must manually call `npc.hydrate(state)`
   *
   * @param {Object|string} npc Npc definition or definition id
   * @return {Npc}
   */
  create(area, definition) {
    definition = typeof definition === 'object' ? definition : this.getDefinition(definition);
    const npc = new Npc(area, definition);
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
}

module.exports = MobFactory;
