'use strict';

const { Broadcast, PlayerRoles } = require('ranvier');

/**
 * Shut down the MUD from within the game.
 */
module.exports = {
  requiredRole: PlayerRoles.ADMIN,
  command: state => (time, player) => {
    if (time === 'now') {
      Broadcast.sayAt(state.PlayerManager, '<b><yellow>Game is shutting down now!</yellow></b>');
      state.PlayerManager.saveAll();
      process.exit();
      return;
    }

    if (!time.length || time !== 'sure') {
      return Broadcast.sayAt(player, 'You must confirm the shutdown with "shutdown sure" or force immediate shutdown with "shutdown now"');
    }

    Broadcast.sayAt(state.PlayerManager, `<b><yellow>Game will shut down in ${30} seconds.</yellow></b>`);
    setTimeout(_ => {
      Broadcast.sayAt(state.PlayerManager, '<b><yellow>Game is shutting down now!</yellow></b>');
      state.PlayerManager.saveAll();
      process.exit();
    }, 30000);
  }
};
