exports.Channels = {
	say: function (args, player, players)
	{
		args = args.replace("\033", '');
		players.broadcastAt("<bold><cyan>[say] " + player.getName() + ":" + args + "</cyan></bold>", player);
		players.eachExcept(player, function (p) {
			if (p.getLocation() === player.getLocation()) {
				p.prompt();
			}
		});
	},
	chat: function (args, player, players)
	{
		args = args.replace("\033", '');
		players.broadcast("<bold><magenta>[general] " + player.getName() + ":" + args + "</magenta></bold>", player);
		players.eachExcept(player, function (p) { p.prompt(); });
	}
};
