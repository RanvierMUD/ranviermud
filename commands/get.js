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

		if (inventoryFull()) {
			player.sayL10n(l10n, 'CARRY_MAX');
			return;
		}

		if (args.toLowerCase() === "all") {
			getAllItems(room);
			return;
		}

		var item = CommandUtil.findItemInRoom(items, args, room, player);
		if (!item) {
			player.sayL10n(l10n, 'ITEM_NOT_FOUND');
			return;
		}
		pickUp(item);

		function pickUp(item){
			item = items.get(item);
			player.sayL10n(l10n, 'ITEM_PICKUP', item.getShortDesc(player.getLocale()));
			item.setRoom(null);
			item.setInventory(player.getName());
			player.addItem(item);
			room.removeItem(item.getUuid());
		}

		function getAllItems(room){
			var items = room.getItems();
			items.forEach(function(item){
				if (!inventoryFull) pickUp(item);
				else player.sayL10n(l10n, 'CARRY_MAX');
			});
		}

		function inventoryFull(){
			return player.getInventory().length >= 20;
		}

	};
};
