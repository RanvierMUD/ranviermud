'use strict';

const ChannelAudience = require('../ChannelAudience');

/**
 * Audience class representing other players in the area as the sender
 */
class Area extends ChannelAudience {
  getBroadcastTargets() {
    const targetPlayerName = this.message.split(' ')[0];
    const targetPlayer = this.state.PlayerManager.getPlayer(targetPlayerName);
    if (targetPlayer) {
      return [targetPlayer];
    }
    return [];
  }

  alterMessage(message) {
    // strip target name from message
    return message.split(' ').slice(1).join(' ');
  }
} 

module.exports = Area;
