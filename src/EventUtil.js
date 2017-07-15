'use strict';

const sty = require('sty');

/**
 * Helper methods for colored output during input-events
 */
class EventUtil {
  /**
   * Generate a function for writing colored output to a socket
   * @param {net.Socket} socket
   * @return {function (string)}
   */
  genWrite(socket) {
    return string => socket.write(sty.parse(string));
  }

  /**
   * Generate a function for writing colored output to a socket with a newline
   * @param {net.Socket} socket
   * @return {function (string)}
   */
  genSay(socket) {
    return string => socket.write(sty.parse(string + '\r\n'));
  }
}

module.exports = EventUtil;
