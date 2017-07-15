'use strict';

const ChannelAudience = require('../ChannelAudience');

/**
 * Audience class representing other players in the same room as the sender
 * Could even be used to broadcast to NPCs if you want them to pick up on dialogue,
 * just make them broadcastables.
 *
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
class RoomAudience extends ChannelAudience {
  getBroadcastTargets() {
    return this.sender.room.getBroadcastTargets()
      .filter(player => player !== this.sender);
  }
}

module.exports = RoomAudience;
