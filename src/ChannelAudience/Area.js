'use strict';

const ChannelAudience = require('../ChannelAudience');

/**
 * Audience class representing other players in the same area as the sender
 */
class Area extends ChannelAudience {
  getBroadcastTargets() {
    // It would be more elegant to just pass the area but that could be super inefficient. If an area has
    // lots of rooms, it would need to iterate over all the rooms to find all the players.
    // Instead, just filter the player list.
    return this.state.PlayerManager.filter(player =>
      player.room &&
      (player.room.area === this.sender.room.area) &&
      (player !== this.sender)
    );
  }
}

module.exports = Area;
