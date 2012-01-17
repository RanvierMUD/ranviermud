var l10n_file = __dirname + '/../l10n/commands/quit.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		if (player.isInCombat()) {
			player.L10n(l10n, 'COMBAT_COMMAND_FAIL');
			return;
		}

		player.emit('quit');
		player.save(function() {
			players.removePlayer(player, true);
		});
		return false;
	};
};
