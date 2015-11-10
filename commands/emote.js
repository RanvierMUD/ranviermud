var l10n_file = __dirname + '/../l10n/commands/emote.yml';
var l10n = require('../src/l10n')(l10n_file);
var CommandUtil = require('../src/command_util').CommandUtil;
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {
    self = player.getName();
    if (args) {
      player.say(self + " " + args);
      players.eachIf(function(p) {
        return otherPlayersInRoom(p);
      }, function(p) {
        p.say(self + " " + args);
      });
      return;
    }

    player.sayL10n(l10n, 'NOTHING_EMOTED');
    return;
  }

  function otherPlayersInRoom(p) {
    if (p)
      return (p.getName() !== player.getName() && p.getLocation() === player.getLocation());
  };


};