exports.listeners = {
  playerEnter: function(l10n) {
    return function(player, players) {
      if (getRand() === 3) {
        player.setAttribute('sanity', player.getAttribute('sanity') -
          getRand());
        player.sayL10n(l10n, 'DISCOMFORT');
      }
    }
  },
};

function getRand() {
  return Math.floor(Math.random() * 5 + 1);
}