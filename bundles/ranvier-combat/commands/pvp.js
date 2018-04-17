'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : (state) => (args, player) => {
      const previousPvpSetting = player.getMeta('pvp') || false;
      const newPvpSetting = !previousPvpSetting;
      player.setMeta('pvp', newPvpSetting);

      const message = newPvpSetting ?
        'You are now able to enter into player-on-player duels.' :
        'You are now a pacifist and cannot enter player-on-player duels.';
      Broadcast.sayAt(player, message);
    }
  };
};
