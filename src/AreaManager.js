'use strict';

const util = require('util');

class AreaManager {
  constructor() {
    this.areas = new Map();
  }

  getArea(name) {
    return this.areas.get(name);
  }

  addArea(area) {
    this.areas.set(area.name, area);
  }

  removeArea(area) {
    this.areas.delete(area.name);
  }

  respawnAll() {
    for (let [ name, area ] of this.areas) {
      area.emit('respawn');
    }
  }

  /**
   * Populate rooms with npcs/items
   * @param {object} state GameState, see: ./ranvier
   * @return {boolean}
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
