'use strict';
const getGenderNoun = require('./status').getGenderNoun;
const newLine = new RegExp('\\n');

exports.Channels = {
	say: {
		name: 'say',
		description: 'Talk to those around you',
		use: (args, player, players) => {
			args = args.replace(newLine, '');
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
		use: (args, player, players) => {
			args = args.replace(newLine, '');
			players.broadcast("<bold><magenta>[chat] " + player.getName() + ": " + args + "</magenta></bold>", player);
			players.eachExcept(player, p => p.prompt());
		}
	},

	yell: {
		name: 'yell',
		description: 'Yell to everyone in the same area',
		use: (args, player, players, rooms) => {
			args = args.replace(newLine, '').toUpperCase();

			const playerRoom = rooms.getAt(player.getLocation());
			const playerArea = playerRoom.getArea();
			const vagueDesc = "a nearby " + getGenderNoun(player) + '\'s voice';

			players.broadcastIf("<bold><red>You hear " + vagueDesc + " yelling '" + args + "!'</red></bold>",
				p => {
					const otherPlayerRoom = rooms.getAt(p.getLocation());
					const otherPlayerArea = otherPlayerRoom.getArea();

					const sameArea = playerArea === otherPlayerArea;
					const notSameRoom = playerRoom !== otherPlayerRoom;
					const notSamePlayer = player !== p;

					return sameArea && notSameRoom && notSamePlayer;
				});

			players.eachExcept(player, p => p.prompt());
			players.broadcastIf("<bold><red>" + player.getName() + " yells '" + args + "!'</red></bold>",
				p => {
					const otherPlayerRoom = rooms.getAt(p.getLocation());
					const otherPlayerArea = otherPlayerRoom.getArea();

					const sameArea = playerArea === otherPlayerArea;
					const sameRoom = playerRoom === otherPlayerRoom;
					const notSamePlayer = player !== p;

					return sameArea && sameRoom && notSamePlayer;
				});
			player.say("<bold><red>You yell, \""+args+"!\"</red></bold>");
		}
	},

	tell: {
		name: 'tell',
		description: 'Talk to a specific person',
		use: (args, player, players) => {
			const nameEnd = args.indexOf(" ");
			const target = args.substring(0, nameEnd).toLowerCase();
			const text = args.substring(nameEnd /* to end of args */);
			const exists = players.some(p => p.getName().toLowerCase() === target);
			const name = player.getName();

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
