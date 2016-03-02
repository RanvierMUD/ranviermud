exports.listeners = {
  playerEnter: function(l10n) {
    return function(player, players) {
      console.log(arguments);
      var rand = getRand();
      if (rand === 3) {
        rand = getRand();
        player.setAttribute('sanity', player.getAttribute('sanity') -
          rand);
        player.sayL10n(l10n, 'DISCOMFORT');
      }
    }
  },
};

function getRand() {
  return Math.floor(Math.random() * 5 + 1);
}