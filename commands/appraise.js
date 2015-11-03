var CommandUtil = require('../src/command_util').CommandUtil;
var l10n_file = __dirname + '/../l10n/commands/appraise.yml';
var l10n = new require('localize')(require('js-yaml').load(require('fs').readFileSync(l10n_file).toString('utf8')), undefined, 'zz');
exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		if (player.isInCombat()) {
			player.sayL10n(l10n, 'APPRAISE_COMBAT');
			return;
		}

		var room = rooms.getAt(player.getLocation());
		var target = CommandUtil.findNpcInRoom(npcs, args, room, player, true);

	}
};
