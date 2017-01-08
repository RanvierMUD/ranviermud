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
    this.npcs.delete(npc);
  }

  /**
   * Put items into their appropriate rooms/containers/npcs
   */
  distributeItems(items) {
    this.putItemsInContainers(items);
    this.putItemsInRooms(items);
    this.giveItemsToNpcs(items);
  }

  distributeNpcs(npcs) {
    // put npcs in their rooms
  }
}

module.exports = Area;
