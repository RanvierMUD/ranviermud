exports.Channels = {
	say: {
		name: 'say',
		description: 'Talk to those around you',
		use: function (args, player, players)
		{
			args = args.replace("\033", '');
			players.broadcastAt("<bold><cyan>" + player.getName() + "</cyan></bold> says '" + args + "'", player);
			players.eachExcept(player, function (p) {
				if (p.getLocation() === player.getLocation()) {
					p.prompt();
				}
			});
		}
	},

	chat: {
		name: 'chat',
		description: 'Talk to everyone online',
		use: function (args, player, players)
		{
			args = args.replace("\033", '');
			players.broadcast("<bold><magenta>[chat] " + player.getName() + ": " + args + "</magenta></bold>", player);
			players.eachExcept(player, function (p) { p.prompt(); });
		}
	}
};
