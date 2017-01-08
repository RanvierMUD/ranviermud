'use strict';

class AreaManager {
  constructor() {
    this.areas = new Set();
  }

  addArea(area) {
    this.areas.add(area);
  }

  removeArea(area) {
    this.areas.delete(area);
  }

  respawnAll() {
    for (let area of this.areas) {
      area.emit('respawn');
    }
  }

  /**
   * Populate rooms with npcs/items
   * @param {object} state GameState, see: ./ranvier
   * @return {boolean}
   */
  distribute(state) {
    for (const area of this.areas) {
      console.log('Distributing to area ' + area.title);
      for (const [ roomId, room ] of area.rooms) {
        console.log('Hydrating room ' + room.title);
        room.hydrate(state);
      }
    }
  }
}

module.exports = AreaManager;
