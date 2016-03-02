exports.listeners = {
  playerEnter: function(l10n) {
    return function(room, rooms, player, players, npc) {
      var rand = getRand();
      if (rand === 3) {
        rand = getRand();
        player.setAttribute('sanity', player.getAttribute('sanity') -
          rand);
        player.sayL10n(l10n, 'DISCOMFORT');
      }
    }
  },
  playerDropItem: function(l10n) {
    return function(room, player) {
      player.sayL10n(l10n, 'PLAYER_DROP');
    }
  },
};

function getRand() {
  return Math.floor(Math.random() * 5 + 1);
}