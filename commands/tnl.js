var sprintf = require('sprintf').sprintf;
var LevelUtil = require('../src/levels').LevelUtil;
exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		var player_exp = player.getAttribute('experience');
		var tolevel    = LevelUtil.expToLevel(player.getAttribute('level'));
		var percent    = (player_exp / tolevel) * 100;

		var bar = new Array(Math.floor(percent)).join("#") + new Array(100 - Math.ceil(percent)).join(" ");
		bar = bar.substr(0, 50) + sprintf("%.2f", percent) + "%" + bar.substr(50);
		bar = sprintf("<bgblue><bold><white>%s</white></bold></bgblue> %d/%d", bar, player_exp, tolevel);

		player.say(bar);
	};
};
