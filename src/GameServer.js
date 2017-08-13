'use strict';

const EventEmitter = require('events');

class GameServer extends EventEmitter
{
  /**
   * @param {commander} commander
   * @fires GameServer#startup
   */
  startup(commander) {
    /**
     * @event GameServer#startup
     * @param {commander} commander
     */
    this.emit('startup', commander);
  }

  /**
   * @fires GameServer#shutdown
   */
  shutdown() {
    /**
     * @event GameServer#shutdown
     */
    this.emit('shutdown');
  }
}

module.exports = GameServer;
