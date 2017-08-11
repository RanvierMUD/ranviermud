'use strict';

const EventEmitter = require('events');

/**
 * Base class for anything that should be sending or receiving data from the player
 */
class TransportStream extends EventEmitter
{
  get readable() {
    return true;
  }

  get writable() {
    return true;
  }

  write() {
    /* noop */
  }

  /**
   * A subtype-safe way to execute commands on a specific type of stream that invalid types will ignore. For given input
   * for command (example, `"someCommand"` ill look for a method called `executeSomeCommand` on the `TransportStream`
   * @param {string} command
   * @param {...*} args
   * @return {*}
   */
  command(command, ...args) {
    if (!command || !command.length) {
      throw new RangeError("Must specify a command to the stream");
    }
    command = 'execute' + command[0].toUpperCase() + command.substr(1);
    if (typeof this[command] === 'function') {
      return this[command](...args);
    }
  }

  address() {
    return null;
  }

  end() {
    /* noop */
  }

  setEncoding() {
    /* noop */
  }

  pause() {
    /* noop */
  }

  resume() {
    /* noop */
  }

  destroy() {
    /* noop */
  }

  attach() {
    /* noop */
  }
}

module.exports = TransportStream;
