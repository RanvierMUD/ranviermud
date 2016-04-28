exports.listeners = {
	wear: () => {
		return (location, player, players) => {
			player.sayL10n(l10n, 'WEAR', this.getShortDesc(player.getLocale()));
		};
	},
	remove: (l10n) => {
		return (player) => {
			player.sayL10n(l10n, 'REMOVE', this.getShortDesc(player.getLocale()));
		};
	}
};
