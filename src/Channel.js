'use strict';

const Broadcast = require('./Broadcast');
const ChannelAudienceWorld = require('./ChannelAudience/World');
const ChannelAudiencePrivate = require('./ChannelAudience/Private');
const util = require('util');

/**
 * @property {ChannelAudience} audience People who receive messages from this channel
 * @property {string}          name     Actual name of the channel the user will type
 * @property {string}          color    Default color. This is purely a helper if you're using default format methods
 */
class Channel {
  constructor(data) {
    this.bundle = null; // for debugging purposes, which bundle it came from
    this.audience = data.audience || (new ChannelAudienceWorld());
    this.color = data.color || null;
    this.name = data.name;
    this.description = data.description;
    this.formatter = data.formatter || {
      sender: this.formatToSender.bind(this),
      target: this.formatToReceipient.bind(this),
    };
  }

  /**
   * @param {GameState} state
   * @param {Player}    sender
   * @param {string}    message
   */
  send(state, sender, message) {
    if (!message.length) {
      Broadcast.sayAt(sender, `Channel: ${this.name}`);
      if (this.description) {
        Broadcast.sayAt(sender, this.description);
      }
      return this.showUsage(sender);
    }

    if (!this.audience) {
      return util.log(`Channel [${this.name} has invalid audience [${this.audience}]`);
    }

    this.audience.configure({ state, sender, message });
    const targets = this.audience.getBroadcastTargets();

    // Allow audience to change message e.g., strip target name
    message = this.audience.alterMessage(message);

    // Private channels also send the target player to the formatter
    if (this.audience instanceof ChannelAudiencePrivate) {
      if (!targets.length) {
        return Broadcast.sayAt(sender, "With no one to hear your message it disappears in the wind.");
      }
      Broadcast.sayAt(sender, this.formatter.sender(sender, targets[0], message, this.colorify.bind(this)));
    } else {
      Broadcast.sayAt(sender, this.formatter.sender(sender, null, message, this.colorify.bind(this)));
    }

    // send to audience targets
    Broadcast.sayAtFormatted(this.audience, message, (target, message) => {
      return this.formatter.target(sender, target, message, this.colorify.bind(this));
    });
  }

  showUsage(sender) {
    if (this.audience instanceof ChannelAudienceWorld) {
      Broadcast.sayAt(sender, `Usage: ${this.name} [target] [message]`);
    } else {
      Broadcast.sayAt(sender, `Usage: ${this.name} [message]`);
    }
  }

  /**
   * How to render the message the player just sent to the channel
   * E.g., you may want "chat" to say "You chat, 'message here'"
   * @param {Player} sender
   * @param {string} message
   * @param {Functino} colorify
   * @return {string}
   */
  formatToSender(sender, target, message, colorify) {
    return colorify(`[${this.name}] ${sender.name}: ${message}`);
  }

  /**
   * How to render the message to everyone else
   * E.g., you may want "chat" to say "Playername chats, 'message here'"
   * @param {Player} sender
   * @param {Player} target
   * @param {string} message
   * @param {Functino} colorify
   * @return {string}
   */
  formatToReceipient(sender, target, message, colorify) {
    return this.formatToSender(sender, target, message, colorify);
  }

  colorify(message) {
    if (!this.color) {
      return message;
    }

    const colors = Array.isArray(this.color) ? this.color : [this.color];

    const open = colors.map(color => `<${color}>`).join('');
    const close = colors.reverse().map(color => `</${color}>`).join('');

    return open + message + close;
  }
}

module.exports = Channel;
