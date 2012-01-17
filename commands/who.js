exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		players.each(function (p) {
			player.say(p.getName());
		});
	};
};
