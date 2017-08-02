'use strict';

/**
 * Keeps track of all the individual rooms in the game
 * @property {string} startingRoom EntityReference of the room players should spawn in when created
 */
class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.startingRoom = null;
  }

  /**
   * @param {string} entityRef
   * @return {Room}
   */
  getRoom(entityRef) {
    return this.rooms.get(entityRef);
  }

  /**
   * @param {Room} room
   */
  addRoom(room) {
    this.rooms.set(room.entityReference, room);
  }

  /**
   * @param {Room} room
   */
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

/**
  * Get the extra descriptions contained in a room by id
  * @param {Room}   room
  * @param {string} id extra description id
  * @return {false|Object}
  */
  findExDesc(room, exDescId) {
    const exdescs = Array.from(room.exdescs).filter(exd => exd.id.indexOf(exDescId) === 0);

    if (!exdescs.length) {
      return false;
    }

    if (exdescs.length > 1) {
      return false;
    }

    return exdescs.pop();
  }
}

module.exports = RoomManager;
