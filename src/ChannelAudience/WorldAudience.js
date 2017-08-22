'use strict';

const ChannelAudience = require('../ChannelAudience');

/**
 * Audience class representing everyone in the game, except sender.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
class WorldAudience extends ChannelAudience {
  getBroadcastTargets() {
    return this.state.PlayerManager.filter(player => player !== this.sender);
  }
}

module.exports = WorldAudience;
