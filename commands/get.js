var l10n_file = __dirname + '/../l10n/commands/get.yml';
var l10n = require('../src/l10n')(l10n_file);
var CommandUtil = require('../src/command_util').CommandUtil;
exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		// No picking stuff up in combat
		if (player.isInCombat()) {
			player.sayL10n(l10n, 'GET_COMBAT');
			return;
		}

		var room = rooms.getAt(player.getLocation());
		if (player.getInventory().length >= 20) {
			player.sayL10n(l10n, 'CARRY_MAX');
			return;
		}

		var item = CommandUtil.findItemInRoom(items, args, room, player);
		if (!item) {
			player.sayL10n(l10n, 'ITEM_NOT_FOUND');
			return;
		}

		item = items.get(item);

		player.sayL10n(l10n, 'ITEM_PICKUP', item.getShortDesc(player.getLocale()));
		item.setRoom(null);
		item.setInventory(player.getName());
		player.addItem(item);
		room.removeItem(item.getUuid());
	};
};
