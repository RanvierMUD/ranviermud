'use strict';

const ansi = require('sty');
const wrap = require('wrap-ansi');
const TypeUtil = require('./TypeUtil');
const Broadcastable = require('./Broadcastable');

class Broadcast {
  static at(source, message, wrapWidth, useColor, formatter) {
    useColor = typeof useColor === 'boolean' ? useColor : true;
    formatter = formatter || ((target, message) => message);

    if (!TypeUtil.is(source, Broadcastable)) {
      throw new Error(`Tried to broadcast message not non-broadcastable object: MESSAGE [${message}]`);
    }

    message = wrapWidth ? wrap(message, wrapWidth) : message;

    const targets = source.getBroadcastTargets();
    targets.forEach(target => {
      if (target.socket.writable) {
        target.socket.write(ansi.parse(formatter(target, message)));
      }
    });
  }

  static atFormatted(source, message, formatter, wrapWidth, useColor) {
    Broadcast.at(source, message, wrapWidth, useColor, formatter);
  }

  static sayAt(source, message, wrapWidth, useColor, formatter) {
    Broadcast.at(source, message, wrapWidth, useColor, (target, message) => {
      return (formatter ? formatter(target, message) : message ) + '\r\n';
    });
  }

  static sayAtFormatted(source, message, formatter, wrapWidth, useColor) {
    Broadcast.sayAt(source, message, wrapWidth, useColor, formatter);
  }

  static isBroadcastable(obj) {
    return Reflect.has(obj, 'getBroadcastTargets');
  }

  static prompt(player, extra, wrapWidth, useColor) {
    Broadcast.sayAt(player, player.interpolatePrompt(player.prompt, extra), wrapWidth, useColor);
  }
}

module.exports = Broadcast;
