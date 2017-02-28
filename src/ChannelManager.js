'use strict';

class ChannelManager {
  constructor() {
    this.channels = new Map();
  }

  get(channel) {
    return this.channels.get(channel);
  }

  add(channel) {
    this.channels.set(channel.name, channel);
  }

  remove(channel) {
    this.channels.delete(channel.name);
  }

  /**
   * @param {string} search
   * @return {Channel}
   */
  find(search) {
    for (const [ name, channel ] of this.channels.entries()) {
      if (name.indexOf(search) === 0) {
        return channel;
      }
    }
  }
}

module.exports = ChannelManager;
