'use strict';

const ChannelAudience = require('../ChannelAudience');

/**
 * Audience class representing other players in the room as the sender
 */
class Room extends ChannelAudience {
  getBroadcastTargets() {
    return this.sender.room.getBroadcastTargets().filter(player => player !== this.sender);
  }
} 

module.exports = Room;
