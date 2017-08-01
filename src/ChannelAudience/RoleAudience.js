const ChannelAudience = require('../ChannelAudience');

class RoleAudience extends ChannelAudience {
  constructor(options) {
    super(options);
    if (!options.hasOwnProperty('minRole')) {
      throw new Error('No role given for role audience');
    }
    this.minRole = options.minRole;
  }

  getBroadcastTargets() {
    return this.state.PlayerManager.filter(player => player.role >= this.minRole);
  }
}

module.exports = RoleAudience;