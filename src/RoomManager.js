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

  /**
   * Get the exit definition of a room's exit by searching the exit name
   * @param {Room}   room
   * @param {string} exitName exit name search
   * @return {false|Object}
   */
  findExit(room, exitName) {
    const exits = Array.from(room.exits).filter(e => e.direction.indexOf(exitName) === 0);

    if (!exits.length) {
      return false;
    }

    if (exits.length > 1) {
      return false;
    }

    return exits.pop();
  }
}

module.exports = RoomManager;

