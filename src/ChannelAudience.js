'use strict';

class ChannelAudience {
  configure(options) {
    this.state = options.state;
    this.sender = options.sender;
    this.message = options.message;
  }

  getBroadcastTargets() {
    return this.state.PlayerManager.getPlayersAsArray();
  }

  alterMessage(message) {
    return message;
  }
}

module.exports = ChannelAudience;
