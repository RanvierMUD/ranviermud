'use strict';

const TransportStream = require('../../../src/TransportStream');

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

  executeSendData(data) {
    if (!this.writable) {
      return;
    }

    this.socket.send(JSON.stringify({
      type: 'data',
      data
    }));
  }

  /**
   * To cue audio or music with Neuro.
   * @param {String} audioCue - Should be the filename with extension, or without extension if the file is .mp3
   * @param {Object} options
   * @param {Boolean} options.looping - For looping music or ambient sound. Only one sound may loop at a time. Looping audio is also background audio by default.
   * @param {Boolean} options.background - For music, ambient sound, or other long-playing bits of audio. May or may not loop.
   */
  executeSendAudio(audioCue, options = {}) {
    if (!this.writable) {
      return;
    }

    this.socket.send(JSON.stringify({
      type: 'audio',
      audioCue,
      options
    }));
  }
}

module.exports = WebsocketStream;
