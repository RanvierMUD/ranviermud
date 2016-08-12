exports.listeners = {
	wield: function (l10n) {
		return function (location, player, players) {
			location = location || 'wield';
			player.sayL10n(l10n, 'WIELD', this.getShortDesc('en'));
			player.equip(location, this);
		}
	},
	remove: function (l10n) {
		return function (player) {
			player.sayL10n(l10n, 'REMOVE', this.getShortDesc('en'));
		}
	},
	hit: function (l10n) {
		return function (player) {
			player.sayL10n(l10n, 'HIT', this.getShortDesc('en'));
		}
	},
	miss: function (l10n) {
		return function (player) {
			player.sayL10n(l10n, 'MISS');
		}
	},
	parry: function (l10n) {
		return function (player) {
			player.sayL10n(l10n, 'PARRY');
		}
	},
};
