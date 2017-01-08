'use strict';

const ansi = require('sty');
const wrap = require('wrap-ansi');

class Broadcast {
  static at(broadcastable, message, wrapWidth, useColor) {
    useColor = typeof useColor === 'boolean' ? useColor : true;

    if (!Broadcast.isBroadcastable(broadcastable)) {
      throw new Error(`Tried to broadcast message not non-broadcastable object: MESSAGE [${message}]`);
    }

    message = wrapWidth ? wrap(message, wrapWidth) : message;

    const targets = broadcastable.getBroadcastTargets();
    targets.forEach(target => {
      target.write(ansi.parse(message));
    });
  }

  static sayAt(broadcastable, message, wrapWidth, useColor) {
    Broadcast.at(broadcastable, message + "\r\n", wrapWidth, useColor);
  }

  static isBroadcastable(obj) {
    return Reflect.has(obj, 'getBroadcastTargets');
  }

  static prompt(player, extra, wrapWidth, useColor) {
    Broadcast.sayAt(player, player.interpolatePrompt(player.prompt, extra), wrapWidth, useColor);
  }
}

module.exports = Broadcast;
