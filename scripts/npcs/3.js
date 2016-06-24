'use strict';

exports.listeners = {
  playerEnter: l10n => {
    return (room, rooms, player, players, npc) => {
      const rand = Math.floor(Math.random() * 5 + 1);
      if (rand === 3) {
        player.say('The defiler\'s maw glistens with spittle as it eyes its prey.');
      }
    }
  },
  playerDropItem: l10n  => {
    return (room, player) => {
      player.say('The defiler croaks, its tongue lolling obscenely out.');
    }
  },
};
