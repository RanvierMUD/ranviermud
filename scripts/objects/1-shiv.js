exports.listeners = {

	wield: function (l10n) {
		return function (location, player, players) {
			player.say('<yellow>You clench the shiv tightly in your fist.</yellow>');
			player.equip(location, this);
			player.combat.addDodgeMod({
				name: 'shiv' + this.getUuid(),
				effect: dodge => dodge + 1
			});
		}
	},

	remove: function (l10n) {
		return function (player) {
			player.say('You carefully stow the shiv away, avoiding the rusty blade.');
			player.combat.removeDodgeMod('shiv' + this.getUuid());
		}
	},

	hit: function (l10n) {
		return function (player) {
			player.say('<bold>Your shank finds purchase in flesh.</bold>');
		}
	},

	parry: function(l10n) {
		return function(player) {
			player.say('You deftly knock your opponent\'s strike away with the point of your blade.');
		}
	}

};
