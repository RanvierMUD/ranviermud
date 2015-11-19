var sprintf = require('sprintf').sprintf;
exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		var equipped = player.getEquipped();
		for (var i in equipped) {
			var item = items.get(equipped[i]);
			player.say(sprintf("%-15s %s", "<" + i + ">", item.getShortDesc(player.getLocale())));
		}
	};
};
