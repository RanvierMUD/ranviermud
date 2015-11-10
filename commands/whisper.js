var l10n_file = __dirname + '/../l10n/commands/whisper.yml';
var l10n = require('../src/l10n')(l10n_file);
var CommandUtil = require('../src/command_util').CommandUtil;
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {
    console.log(args);
    args = args.split(' ');
    console.log(args);
    if (args.length > 1) {
      player.sayL10n(l10n, 'YOU_WHISPER', args[0], args[1]);
      players.eachIf(function(p) {
        return otherPlayersInRoom(p);
      }, function(p) {
        if (p.getName() == args[0])
          p.sayL10n(l10n, 'THEY_WHISPER', player.getName(), args[1]);
        else
          p.sayL10n(l10n, 'OTHERS_WHISPER', player.getName(), args[0]);
      });
      return;
    }

    player.sayL10n(l10n, 'NOTHING_SAID');
    return;
  }

  function otherPlayersInRoom(p) {
    if (p)
      return (p.getName() !== player.getName() && p.getLocation() === player.getLocation());
  };


};