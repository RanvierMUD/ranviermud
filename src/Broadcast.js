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
      if (target.socket && target.socket.writable) {
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

  /**
   * Generate an ASCII art progress bar
   * @param {number} width Max width
   * @param {number} percent Current percent
   * @param {string} color
   * @param {string} barChar Character to use for the current progress
   * @param {string} fillChar Character to use for the rest
   * @param {string} delimiters Characters to wrap the bar in
   * @return {string}
   */
  static progress(width, percent, color, barChar = "#", fillChar = " ", delimiters = "()") {
    width -= 3; // account for delimiters and tip of bar
    barChar = barChar[0];
    fillChar = fillChar[0];
    const [ leftDelim, rightDelim ] = delimiters;
    const openColor = `<${color}>`;
    const closeColor = `</${color}>`;
    let buf = openColor + leftDelim + "<bold>";
    const widthPercent = Math.round((percent / 100) * width);
    buf += new Array(widthPercent).join(barChar) + (percent === 100 ? '' : ')');
    buf += new Array(width - widthPercent).join(fillChar);
    buf += "</bold>" + rightDelim + closeColor;
    return buf;
  }
}

module.exports = Broadcast;
