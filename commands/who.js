exports.command = (rooms, items, players, npcs, Commands) => {
	return (args, player) => players.each(p => player.say(p.getName()));
};
