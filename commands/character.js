var l10n_file = __dirname + '/../l10n/commands/character.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {

  function capitalizeFirstLetter(string) {
    if (typeof string == 'string')
      return string.charAt(0).toUpperCase() + string.slice(1);
    return string;
  }

  return function(args, player) {
    var character = player.getAttributes() || {};
    var hr = function() {
      player.say("\n=======================");
    };
    hr();
    player.say("|| " + player.getName());
    hr();
    player.sayL10n(l10n, 'ATTRIBUTES');
    for (var attr in character) {
      player.sayL10n(l10n, attr.toUpperCase(), capitalizeFirstLetter(character[attr]));
    }
    hr();
  };
};