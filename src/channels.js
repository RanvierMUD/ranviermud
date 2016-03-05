var getGenderNoun = require('./status').getGenderNoun;

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

	yell: {
		name: 'yell',
		description: 'Yell to everyone in the same area',
		use: function (args, player, players, rooms)
		{
			var playerArea = rooms.getAt(player.getLocation()).getArea();
			var vagueDesc = "a nearby " + getGenderNoun(player) + '\'s voice';
			args = args.replace("\033", '').toUpperCase();
			players.broadcastIf("<bold><red>[yelling] " + vagueDesc + ": " + args + "!</red></bold>", function(p){ return playerArea === rooms.getAt(p.getLocation()).getArea() && player !== p; });
			players.eachExcept(player, function (p) { p.prompt(); });
			player.say("<bold><red>You yell, \""+args+"!\"</red></bold>");
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
			var exists = players.some(function(p){ return p.getName() === target; });
			if (exists){
				players.broadcastIf("<bold><magenta>" + player.getName() + " told you: " + text + "</magenta></bold>", function(p){return p.getName() === target; });
				player.say("<bold><magenta>You told " + target + ": " + text + "</magenta></bold>", player);
			}
			else {
				player.say("<bold><magenta>" + target + " is not logged in.</magenta></bold>", player);
			}
			players.eachIf(function(p){ return p.getName() === player || p.getName() === target; }, function (p) { p.prompt(); });
		}
	}
};
