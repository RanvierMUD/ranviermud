'use strict';

const ChannelAudience = require('../ChannelAudience');

/**
 * Audience class representing everyone in the game, except sender.
 */
class World extends ChannelAudience {
  getBroadcastTargets() {
    return this.state.PlayerManager.filter(player => player !== this.sender);
  }
}

module.exports = World;
