'use strict';

const EventEmitter = require('events');

class Area extends EventEmitter {
  constructor(bundle, name, manifest) {
    super();
    this.bundle = bundle;
    this.name = name;
    this.title = manifest.title;
    this.rooms = new Map();
    this.npcs = new Set();
    this.info = Object.assign({
      // respawn interval in seconds
      respawnInterval: 60
    }, manifest.info || {});

    this.lastRespawnTick = -Infinity;

    this.on('updateTick', state => {
      this.update(state);
    });
  }

  /**
   * Get ranvier-root-relative path to this area
   * @return {string}
   */
  get areaPath() {
    return `${this.bundle}/areas/${this.name}`;
  }

  getRoomById(id) {
    return this.rooms.get(id);
  }

  addRoom(room) {
    this.rooms.set(room.id, room);
  }

  removeRoom(room) {
    this.rooms.delete(room.id);
  }

  addNpc(npc) {
    this.npcs.add(npc);
  }

  removeNpc(npc) {
    if (npc.room) {
      npc.room.removeNpc(npc);
      npc.sourceRoom.removeSpawnedNpc(npc);
    }

    this.npcs.delete(npc);
  }

  update(state) {
    for (const npc of this.npcs) {
      npc.emit('updateTick');
    }

    for(const [id, room] of this.rooms) {
      room.emit('updateTick');
    }

    // handle respawn
    const sinceLastTick = Date.now() - this.lastRespawnTick;
    if (sinceLastTick >= this.info.respawnInterval * 1000) {
      this.lastRespawnTick = Date.now();
      for (const [id, room] of this.rooms) {
        room.emit('respawnTick', state);
      }
    }
  }
}

module.exports = Area;
