exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		player.write(rooms.getAt(player.getLocation()).getArea() + "\r\n");
	};
};
