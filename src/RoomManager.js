'use strict';

const Room = require('./Room');

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.startingRoom = null;
  }

  getRoom(entityRef) {
    return this.rooms.get(entityRef);
  }

  addRoom(room) {
    this.rooms.set(room.entityReference, room);
  }

  removeRoom(room) {
    this.rooms.delete(room.entityReference);
  }
}

module.exports = RoomManager;

