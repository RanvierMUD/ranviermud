'use strict';

const { Options, Sequences } = require('ranvier-telnet');
const { TransportStream } = require('ranvier');

/**
 * Thin wrapper around a ranvier-telnet `TelnetSocket`
 */
class TelnetStream extends TransportStream
{
  attach(socket) {
    super.attach(socket);

    socket.on('data', message => {
      this.emit('data', message);
    });

    socket.on('error', err => {
      this.emit('error', err);
    });

    this.socket.on('DO', opt => {
      this.socket.telnetCommand(Sequences.WONT, opt);
    });
  }

  get writable() {
    return this.socket.writable;
  }

  write(message, encoding = 'utf8') {
    if (!this.writable) {
      return;
    }

    this.socket.write(message, encoding);
  }

  pause() {
    this.socket.pause();
  }

  resume() {
    this.socket.resume();
  }

  end() {
    this.socket.end();
  }

  executeToggleEcho() {
    this.socket.toggleEcho();
  }
}

module.exports = TelnetStream;
