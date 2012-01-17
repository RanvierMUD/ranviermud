var l10n_file = __dirname + '/../l10n/commands/save.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		player.save(function () {
			player.sayL10n(l10n, 'SAVED');
		});
	};
};
