var l10n_file = __dirname + '/../l10n/commands/drop.yml';
var l10n = require('../src/l10n')(l10n_file);
var CommandUtil = require('../src/command_util').CommandUtil;
exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		var room = rooms.getAt(player.getLocation());
		var item = CommandUtil.findItemInInventory(args, player, true);

		if (!item) {
			player.sayL10n(l10n, 'ITEM_NOT_FOUND');
			return;
		}

		if (item.isEquipped()) {
			player.sayL10n(l10n, 'ITEM_WORN');
			return;
		}

		player.sayL10n(l10n, 'ITEM_DROP', item.getShortDesc(player.getLocale()), false);
		players.broadcastAtIfL10n(player, function(p){ return p.getName() !== player.getName(); }, l10n, 'ITEM_DROP_WATCH', player.getName(), item.getShortDesc(player.getLocale()));
		//players.broadcastAtIf(player.getName() + " drops " + item.getShortDesc(player.getLocale()) + ".", player, function(p){ return p.getName() !== player.getName(); });
		room.getNpcs().forEach(function (id) {
			npcs.get(id).emit('playerDropItem', room, player, players, item);
		});

		player.removeItem(item);
		room.addItem(item.getUuid());
		item.setInventory(null);
		item.setRoom(room.getLocation());
	};
};
