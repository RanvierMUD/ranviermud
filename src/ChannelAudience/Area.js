'use strict';

const ChannelAudience = require('../ChannelAudience');

/**
 * Audience class representing other players in the area as the sender
 */
class Area extends ChannelAudience {
  getBroadcastTargets() {
    // It would be more elegant to just pass the area but that could be super inneficient if an area has
    // lots of rooms to iterate over all the rooms to find all the players, so instead just filter
    // the player list
    return this.state.PlayerManager.filter(player => {
      return player.room && player.room.area === this.sender.room.area && player !== this.sender;
    });
  }
} 

module.exports = Area;
