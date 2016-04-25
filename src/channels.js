var getGenderNoun = require('./status').getGenderNoun;

exports.Channels = {
	say: {
		name: 'say',
		description: 'Talk to those around you',
		use: (args, player, players) =>
		{
			args = args.replace("\033", '');
			players.broadcastAt("<bold><cyan>" + player.getName() + "</cyan></bold> says '" + args + "'", player);
			players.eachExcept(player, p => {
				if (p.getLocation() === player.getLocation()) {
					p.prompt();
				}
			});
		}
	},

	chat: {
		name: 'chat',
		description: 'Talk to everyone online',
		use: (args, player, players) =>
		{
			args = args.replace("\033", '');
			players.broadcast("<bold><magenta>[chat] " + player.getName() + ": " + args + "</magenta></bold>", player);
			players.eachExcept(player, p => p.prompt());
		}
	},

	yell: {
		name: 'yell',
		description: 'Yell to everyone in the same area',
		use: (args, player, players, rooms) =>
		{
			args = args.replace("\033", '').toUpperCase();

			var playerRoom = rooms.getAt(player.getLocation());
			var playerArea = playerRoom.getArea();
			var vagueDesc = "a nearby " + getGenderNoun(player) + '\'s voice';

			players.broadcastIf("<bold><red>You hear " + vagueDesc + " yelling '" + args + "!'</red></bold>",
				p => {
					var otherPlayerRoom = rooms.getAt(p.getLocation());
					var otherPlayerArea = otherPlayerRoom.getArea();

					var sameArea = playerArea === otherPlayerArea;
					var notSameRoom = playerRoom !== otherPlayerRoom;
					var notSamePlayer = player !== p;

					return sameArea && notSameRoom && notSamePlayer;
				});

			players.eachExcept(player, p => p.prompt());
			players.broadcastIf("<bold><red>" + player.getName() + " yells '" + args + "!'</red></bold>",
				p => {
					var otherPlayerRoom = rooms.getAt(p.getLocation());
					var otherPlayerArea = otherPlayerRoom.getArea();

					var sameArea = playerArea === otherPlayerArea;
					var sameRoom = playerRoom === otherPlayerRoom;
					var notSamePlayer = player !== p;
					return sameArea && sameRoom && notSamePlayer;
				});
			player.say("<bold><red>You yell, \""+args+"!\"</red></bold>");
		}
	},

	tell: {
		name: 'tell',
		description: 'Talk to a specific person',
		use: (args, player, players) =>
		{
			var nameEnd = args.indexOf(" ");
			var target = args.substring(0,nameEnd).toLowerCase();
			var text = args.substring(nameEnd);
			var exists = players.some(p => p.getName().toLowerCase() === target);
			var name = player.getName();
			if (exists) {
				players.broadcastIf("<bold><magenta>" + player.getName() + " told you: " + text + "</magenta></bold>",
					p => p.getName().toLowerCase() === target);
				player.say("<bold><magenta>You told " + target + ": " + text + "</magenta></bold>", player);
			} else {
				player.say("<bold><magenta>" + target + " is not logged in.</magenta></bold>", player);
			}
			players.eachIf( p => p.getName() === name || p.getName().toLowerCase() === target,
			 p => p.prompt());
		}
	}
};
