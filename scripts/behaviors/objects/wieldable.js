exports.listeners = {
	wield: (l10n) => {
		return (location, player, players) => {
			location = location || body;
			player.sayL10n(l10n, 'WIELD', this.getShortDesc(player.getLocale()));
			player.equip(location, this);
			//TODO: broadcast to other players in room
		}
	},
	remove: (l10n) => {
		return (player) => {
			player.sayL10n(l10n, 'REMOVE', this.getShortDesc(player.getLocale()));
		}
	},
	hit: (l10n) => {
		return (player) => {
			player.sayL10n(l10n, 'HIT', this.getShortDesc(player.getLocale()));
		}
	},
	miss: (l10n) =>
	{
		return (player) => {
			player.sayL10n(l10n, 'MISS');
		}
	},
	parry: (l10n) => {
		return (player) => {
			player.sayL10n(l10n, 'PARRY');
		}
	},
};
