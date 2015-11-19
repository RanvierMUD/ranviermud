var sprintf = require('sprintf').sprintf;
exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		var equipped = player.getEquipped();
		console.log("EQ: ",equipped);
		for (var i in equipped) {
			console.log("i: ",i)
			var item = items.get(equipped[i]);
			console.log("item: ",item);
			player.say(sprintf("%-15s %s", "<" + i + ">", item.getShortDesc(player.getLocale())));
		}
	};
};
