exports.listeners = {
	wear: function (l10n) {
		return function (location, room, player, players) {
			player.sayL10n(l10n, 'WEAR', this.getShortDesc('en'));
		};
	},
	remove: function (l10n) {
		return function (room, player, players) {
			player.sayL10n(l10n, 'REMOVE', this.getShortDesc('en'));
		};
	}
};
