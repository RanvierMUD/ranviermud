var l10n_file = __dirname + '/../l10n/commands/say.yml';
var l10n = require('../src/l10n')(l10n_file);
var CommandUtil = require('../src/command_util').CommandUtil;
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {
    if (args) {
      player.sayL10n(l10n, 'YOU_SAY', args);
      players.eachIf(function(p) {
        return otherPlayersInRoom(p);
      }, function(p) {
        if (p.getName() != player.getName())
          p.sayL10n(l10n, 'THEY_SAY', player.getName(), args);
      });
      return;
    }

    player.sayL10n(l10n, 'NOTHING_SAID');
    return;

    function otherPlayersInRoom(p) {
      if (p)
        return (p.getName() !== player.getName() && p.getLocation() === player.getLocation());
    };

  }

};