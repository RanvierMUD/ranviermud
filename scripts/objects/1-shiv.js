exports.listeners = {

	wield: function (l10n) {
		return function (location, player, players) {
			player.say('<yellow>You clench the shiv tightly in your fist.</yellow>');
			player.equip(location, this);
		}
	},

	remove: function (l10n) {
		return function (player) {
			player.say('You carefully stow the shiv away, avoiding the rusty blade.');
		}
	},
};
