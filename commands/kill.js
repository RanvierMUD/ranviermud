var CommandUtil = require('../src/command_util').CommandUtil;
var l10n_file = __dirname + '/../l10n/commands/kill.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		var npc = CommandUtil.findNpcInRoom(npcs, args, rooms.getAt(player.getLocation()), player, true);
		if (!npc) {
			player.sayL10n(l10n, 'TARGET_NOT_FOUND');
			return;
		}
		if (!npc.listeners('combat').length) {
			player.sayL10n(l10n, 'KILL_PACIFIST');
			return;
		}

		npc.emit('combat', player, rooms.getAt(player.getLocation()), players, npcs, function (success) {
			// cleanup here...
		});
	};
};
