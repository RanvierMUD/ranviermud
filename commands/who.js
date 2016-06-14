exports.command = (rooms, items, players, npcs, Commands) =>
	(args, player) =>
		players.each(p => player.say(p.getName()));
