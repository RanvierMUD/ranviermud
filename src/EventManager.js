'use strict';

/**
 * Holds player events loaded from all the various packages.
 * Removing events from this manager wouldn't do anything since the
 * listeners have already been set on the socket* 
 */
class EventManager {
  constructor() {
    this.events = new Map();
  }

  getEvent(name) {
    return this.events.get(name);
  }

  addEvent(name, event) {
    this.events.set(name, event);
  }
}

module.exports = EventManager;

