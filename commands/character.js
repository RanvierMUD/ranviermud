var l10n_file = __dirname + '/../l10n/commands/character.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {
	
	return function(args, player) {
		var character = player.getAttributes() || {};
		var name = player.getName() || "";
		var hr = player.say("\n=======================");
		console.log("Character attributes are: ", character);
		player.sayL10n(l10n, 'NAME', name);
		player.sayL10n(l10n, 'ATTRIBUTES');
		hr();
		for (attr in character) {
			player.sayL10n(l10n, attr.toUppercase(), character[attr]);
		}
		hr();
	};
};