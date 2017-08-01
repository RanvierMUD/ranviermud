'use strict';

/**
 * Contains registered channels
 *
 * TODO: should probably refactor this to just extend `Map`
 */
class ChannelManager {
  constructor() {
    this.channels = new Map();
  }

  /**
   * @param {string} name Channel name
   * @return {Channel}
   */
  get(name) {
    return this.channels.get(name);
  }

  /**
   * @param {Channel} channel
   */
  add(channel) {
    this.channels.set(channel.name, channel);
  }

  /**
   * @param {Channel} channel
   */
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
