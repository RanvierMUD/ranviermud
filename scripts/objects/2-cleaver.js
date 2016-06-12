exports.listeners = {

  wield: function (l10n) {
    return function (location, player, players) {
      player.say('You ready the weighty cleaver.');
    }
  },

  remove: function (l10n) {
    return function (player) {
      player.say('You place the bulky cleaver in your pack.');
    }
  },
};
