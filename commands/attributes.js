var l10n_file = __dirname + '/../l10n/commands/inventory.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {
	return function(args, player) {

		var displayed = {};
		displayed = player.getAttributes();
		console.log("displayed is " + displayed);
		player.say("Attributes:");
		player.say("===========");
		for (attr in displayed) {
			player.say(attr.toUpperCase() + ": " + displayed[attr]);
		}
		player.say("===========");
	};
};
