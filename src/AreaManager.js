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
}

module.exports = AreaManager;
