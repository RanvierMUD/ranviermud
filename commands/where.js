exports.command = (rooms, items, players, npcs, Commands) => {
	return (args, player) => player.write(rooms.getAt(player.getLocation()).getArea() + "\r\n");
};
