'use strict';

const ansi = require('sty');
const wrap = require('wrap-ansi');

class Broadcast {
  static at(broadcastable, message, wrapWidth, useColor, formatter) {
    useColor = typeof useColor === 'boolean' ? useColor : true;
    formatter = formatter || ((target, message) => message);

    if (!Broadcast.isBroadcastable(broadcastable)) {
      throw new Error(`Tried to broadcast message not non-broadcastable object: MESSAGE [${message}]`);
    }

    message = wrapWidth ? wrap(message, wrapWidth) : message;

    const targets = broadcastable.getBroadcastTargets();
    targets.forEach(target => {
      if (target.socket.writable) {
        target.socket.write(ansi.parse(formatter(target, message)));
      }
    });
  }

  static atFormatted(broadcastable, message, formatter, wrapWidth, useColor) {
    Broadcast.at(broadcastable, message, wrapWidth, useColor, formatter);
  }

  static sayAt(broadcastable, message, wrapWidth, useColor, formatter) {
    Broadcast.at(broadcastable, message, wrapWidth, useColor, (target, message) => {
      return (formatter ? formatter(target, message) : message ) + '\r\n';
    });
  }

  static sayAtFormatted(broadcastable, message, formatter, wrapWidth, useColor) {
    Broadcast.sayAt(broadcastable, message, wrapWidth, useColor, formatter);
  }

  static isBroadcastable(obj) {
    return Reflect.has(obj, 'getBroadcastTargets');
  }

  static prompt(player, extra, wrapWidth, useColor) {
    Broadcast.sayAt(player, player.interpolatePrompt(player.prompt, extra), wrapWidth, useColor);
  }
}

module.exports = Broadcast;
