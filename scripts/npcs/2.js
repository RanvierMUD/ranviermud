'use strict';

exports.listeners = {
  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Math.floor(Math.random() * 5 + 1);
      if (rand === 3) {
        player.sayL10n(l10n, 'PLAYER_ENTER');
      }
    }
  },
  playerDropItem: l10n  => {
    return (room, player) => {
      player.sayL10n(l10n, 'PLAYER_DROP');
    }
  },
};
