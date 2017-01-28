'use strict';

const Npc = require('./Npc');
const BehaviorManager = require('./BehaviorManager');
const EntityFactory = require('./EntityFactory');

/**
 * Stores definitions of npcs to allow for easy creation/cloning
 */
class MobFactory extends EntityFactory {
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
    const npc = this.createByType(area, definition, Npc);
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
    data.room = null;

    let newNpc = new Npc(data);
    newNpc.area = npc.area;
    return newNpc;
  }
}

module.exports = MobFactory;
