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

  command() {
    /* noop */
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
