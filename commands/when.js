const Time = require('../src/time').Time;

exports.command = (rooms, items, players, npcs, Commands) =>
	(args, player) => Time.isDay() ? player.say('It is daytime.') : player.say('It is nighttime.');
