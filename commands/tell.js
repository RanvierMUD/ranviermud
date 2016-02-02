var l10n_file = __dirname + '/../l10n/commands/tell.yml';
var l10n = require('../src/l10n')(l10n_file);
var CommandUtil = require('../src/command_util').CommandUtil;
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {

    var message = args.split(' ');
    var recipient = message.shift();
    message = message.join(' ');

    if (recipient) {
      player.sayL10n(l10n, 'YOU_TELL', recipient, message);
      players.eachIf(
        playerIsOnline,
        tellPlayer
      );
      return;
    }

    player.sayL10n(l10n, 'NOTHING_TOLD');
    return;

    function tellPlayer(p) {
      if (recipient.toLowerCase() !== player.getName().toLowerCase())
        p.sayL10n(l10n, 'THEY_TELL', player.getName(), message);
      else
        player.sayL10n(l10n, 'CRAZY');
    }

    function playerIsOnline(p) {
      if (p)
        return (recipient.toLowerCase() === p.getName().toLowerCase());
    };

  }


};