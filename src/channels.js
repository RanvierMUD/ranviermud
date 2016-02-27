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
	},

	tell: {
		name: 'tell',
		description: 'Talk to a specific person',
		use: function (args, player, players)
		{
			var nameEnd = args.indexOf(" ");
			var target = args.substring(0,nameEnd);
			var text = args.substring(nameEnd);
			players.broadcastIf("<bold><magenta>" + player.getName() + " told you: " + text + "</magenta></bold>", function(p){return p.getName() === target});
			player.say("<bold><magenta>You told " + target + ": " + text + "</magenta></bold>", player);
			players.eachIf(function(p){ return p.getName() === player || p.getName() === target}, function (p) { p.prompt(); });
		}
	}
};
