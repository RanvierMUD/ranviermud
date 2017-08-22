'use strict';

const ChannelAudience = require('../ChannelAudience');

/**
 * Audience class representing other players in the same group as the sender
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
class PartyAudience extends ChannelAudience {
  getBroadcastTargets() {
    if (!this.sender.party) {
      return [];
    }

    return this.sender.party.getBroadcastTargets()
      .filter(player => player !== this.sender);
  }
}

module.exports = PartyAudience;
