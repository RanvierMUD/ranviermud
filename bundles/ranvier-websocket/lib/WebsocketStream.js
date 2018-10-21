'use strict';

const { TransportStream } = require('ranvier');

/**
 * Essentially we want to look at the methods of WebSocket and match them to the appropriate methods on TransportStream
 */
class WebsocketStream extends TransportStream
{
  attach(socket) {
    super.attach(socket);

    // websocket uses 'message' instead of the 'data' event net.Socket uses
    socket.on('message', message => {
      this.emit('data', message);
    });
  }

  get writable() {
    return this.socket.readyState === 1;
  }

  write(message) {
    if (!this.writable) {
      return;
    }

    // this.socket will be set when we do `ourWebsocketStream.attach(websocket)`
    this.socket.send(JSON.stringify({
      type: 'message',
      message,
    }));
  }

  pause() {
    this.socket.pause();
  }

  resume() {
    this.socket.resume();
  }

  end() {
    // 1000 = normal close, no error
    this.socket.close(1000);
  }

  executeSendData(group, data) {
    if (!this.writable) {
      return;
    }

    this.socket.send(JSON.stringify({
      type: 'data',
      group,
      data
    }));
  }
}

module.exports = WebsocketStream;
