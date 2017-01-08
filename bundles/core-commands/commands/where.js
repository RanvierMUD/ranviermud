exports.command = (rooms, items, players, npcs, Commands) =>
	(args, player) => player.write(rooms.getAt(player.getLocation()).getArea() + "\r\n");
