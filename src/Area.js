'use strict';

const EventEmitter = require('events');

class Area extends EventEmitter {
  constructor(bundle, name, manifest) {
    super();
    this.bundle = bundle;
    this.name = name;
    this.title = manifest.title;
    this.suggestedRange = manifest.suggestedLevel;
    this.rooms = new Map();
    this.npcs = new Set();

    this.on('updateTick', () => {
      this.update();
    });
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
    }
    this.npcs.delete(npc);
  }

  update() {
    for (const npc of this.npcs) {
      npc.emit('updateTick');
    }

    for(const [id, room] of this.rooms) {
      room.emit('updateTick');
    }
  }
}

module.exports = Area;
