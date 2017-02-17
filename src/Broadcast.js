'use strict';

const ansi = require('sty');
const wrap = require('wrap-ansi');
const TypeUtil = require('./TypeUtil');
const Broadcastable = require('./Broadcastable');

class Broadcast {
  static at(source, message = '', wrapWidth = false, useColor = true, formatter = null) {
    useColor = typeof useColor === 'boolean' ? useColor : true;
    formatter = formatter || ((target, message) => message);

    if (!TypeUtil.is(source, Broadcastable)) {
      throw new Error(`Tried to broadcast message not non-broadcastable object: MESSAGE [${message}]`);
    }

    message = wrapWidth ? Broadcast.wrap(message, wrapWidth) : message;

    const targets = source.getBroadcastTargets();
    targets.forEach(target => {
      if (target.socket && target.socket.writable) {
        if (target.socket._prompted) {
          target.socket.write('\r\n');
          target.socket._prompted = false;
        }
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

  /**
   * Render the player's prompt including any extra prompts
   * @param {Player} player
   * @param {object} extra     extra data to avail to the prompt string interpolator
   * @param {number} wrapWidth
   * @param {boolean} useColor
   */
  static prompt(player, extra, wrapWidth, useColor) {
    player.socket._prompted = false;
    Broadcast.at(player, '\r\n' + player.interpolatePrompt(player.prompt, extra) + ' ', wrapWidth, useColor);
    let needsNewline = player.extraPrompts.size > 0;
    if (needsNewline) {
      Broadcast.sayAt(player);
    }

    for (const [id, extraPrompt] of player.extraPrompts) {
      Broadcast.sayAt(player, extraPrompt.renderer(), wrapWidth, useColor);
      if (extraPrompt.removeOnRender) {
        player.removePrompt(id);
      }
    }

    if (needsNewline) {
      Broadcast.at(player, '> ');
    }

    player.socket._prompted = true;
    if (player.socket.writable) {
      player.socket.goAhead();
    }
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
    percent = Math.max(0, percent);
    width -= 3; // account for delimiters and tip of bar
    barChar = barChar[0];
    fillChar = fillChar[0];
    const [ leftDelim, rightDelim ] = delimiters;
    const openColor = `<${color}>`;
    const closeColor = `</${color}>`;
    let buf = openColor + leftDelim + "<bold>";
    const widthPercent = (percent / 100) * width;
    buf += new Array(Math.round(widthPercent)).join(barChar) + (percent === 100 ? '' : ')');
    buf += new Array(width - Math.round(widthPercent)).join(fillChar);
    buf += "</bold>" + rightDelim + closeColor;
    return buf;
  }

  static wrap(message, width) {
    let out = wrap(message, 80);
    // Fix \n not in a \r\n pair to prevent bad rendering on windows
    out = out.replace(/\r\n/, '<NEWLINE>').split('\n');
    out = out.join('\r\n').replace('<NEWLINE>', '\r\n');
    return out;
  }
}

module.exports = Broadcast;
