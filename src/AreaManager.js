'use strict';

/**
 * Stores references to, and handles distribution of, active areas
 * @property {Map<string,Area>} areas
 */
class AreaManager {
  constructor() {
    this.areas = new Map();
  }

  /**
   * @param {string} name
   * @return Area
   */
  getArea(name) {
    return this.areas.get(name);
  }

  /**
   * @param {string} entityRef
   * @return Area
   */
  getAreaByReference(entityRef) {
    const [ name ] = entityRef.split(':');
    return this.getArea(name);
  }

  /**
   * @param {Area} area
   */
  addArea(area) {
    this.areas.set(area.name, area);
  }

  /**
   * @param {Area} area
   */
  removeArea(area) {
    this.areas.delete(area.name);
  }

  /**
   * Apply `updateTick` to all areas in the game
   * @param {GameState} state
   */
  tickAll(state) {
    for (const [ name, area ] of this.areas) {
      area.emit('updateTick', state);
    }
  }

  /**
   * Hydrate all rooms in all areas
   * @param {GameState} state
   */
  distribute(state) {
    for (const [ name, area ] of this.areas) {
      for (const [ roomId, room ] of area.rooms) {
        room.hydrate(state);
      }
    }
  }
}

module.exports = AreaManager;
