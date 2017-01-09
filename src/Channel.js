'use strict';

const Broadcast = require('./Broadcast');
const ChannelAudience = require('./ChannelAudience');

/**
 * @property {ChannelAudience} audience People who receive messages from this channel
 * @property {string}          name     Actual name of the channel the user will type
 * @property {string}          color    Default color. This is purely a helper if you're using default format methods
 */
class Channel {
  constructor(data) {
    this.bundle = null; // for debugging purposes, which bundle it came from
    this.audience = data.audience || ChannelAudience.WORLD;
    this.color = data.color || null;
    this.name = data.name;
    this.description = data.description;
    this.formatter = data.formatter || {
      sender: this.formatToSender.bind(this),
      target: this.formatToReceipient.bind(this),
    };
  }

  send(state, sender, message) {
    if (!message.length) {
      Broadcast.sayAt(sender, `Channel: ${this.name}`);
      if (this.description) {
        Broadcast.sayAt(sender, this.description);
      }
      return this.showUsage(sender);
    }

    let targets = null;
    switch (this.audience) {
      case ChannelAudience.ROOM: {
        targets = new class {
          getBroadcastTargets() {
            return sender.room.getBroadcastTargets().filter(player => player !== sender);
          }
        };
        break;
      }
      case ChannelAudience.AREA: {
        // It would be more elevant to just pass the area but that could be super inneficient if an area has
        // lots of rooms to iterate over all the rooms to find all the players, so instead just filter
        // the player list
        targets = new class {
          getBroadcastTargets() {
            return state.PlayerManager.filter(player => {
              return player.room && player.room.area === sender.room.area && player !== sender;
            });
          }
        };
        break;
      }
      case ChannelAudience.WORLD: {
        targets = state.PlayerManager;
        targets = new class {
          getBroadcastTargets() {
            return state.PlayerManager.filter(player => player !== sender);
          }
        };
        break;
      }
      case ChannelAudience.PRIVATE: {
        const targetPlayerName = message.split(' ')[0];
        let targetPlayer = state.PlayerManager.getPlayer(targetPlayerName);
        if (targetPlayer) {
          targets = new class {
            getBroadcastTargets() {
              return [targetPlayer];
            }
          };
          break;
        }
        return Broadcast.sayAt(sender, "That player isn't online.");
      }
      default: {
        return util.log(`Channel [${this.name} has invalid audience [${this.audience}]`);
      }
    }
    Broadcast.sayAt(sender, this.formatter.sender(sender, message, this.colorify.bind(this)));

    Broadcast.sayAtFormatted(targets, message, (target, message) => {
      return this.formatter.target(target, sender, message, this.colorify.bind(this));
    });
  }

  showUsage(sender) {
    switch (this.audience) {
      case ChannelAudience.PRIVATE: {
        return Broadcast.sayAt(sender, `Usage: ${this.name} [target] [message]`);
      }
      default: {
        return Broadcast.sayAt(sender, `Usage: ${this.name} [message]`);
      }
    }
  }

  /**
   * How to render the message the player just sent to the channel
   * E.g., you may want "chat" to say "You chat, 'message here'"
   * @param {Player} sender
   * @param {string} message
   * @return {string}
   */
  formatToSender(sender, message, colorify) {
    return colorify(`[${this.name}] ${sender.name}: ${message}`);
  }

  /**
   * How to render the message to everyone else
   * E.g., you may want "chat" to say "Playername chats, 'message here'"
   * @param {Player} target
   * @param {Player} sender
   * @param {string} message
   * @return {string}
   */
  formatToReceipient(target, sender, message, colorify) {
    return this.formatToSender(sender, message, colorify);
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
