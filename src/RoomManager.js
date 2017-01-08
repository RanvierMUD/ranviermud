'use strict';

const Room = require('./Room');

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  getRoom(roomKey, area) {
    if (parseInt(roomKey, 10) && area) {
      roomKey = area.name + ':' + roomKey;
    }
    return this.rooms.get(roomKey);
  }

  addRoom(room) {
    this.rooms.set(Room.getKey(room), room);
  }

  removeRoom(room) {
    this.rooms.delete(Room.getKey(room));
  }
}

module.exports = RoomManager;

