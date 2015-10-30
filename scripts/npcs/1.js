exports.listeners = {
	playerEnter: function (l10n)
	{
		return function (room, player)
		{
			var rand = Math.floor(Math.random() * 5 + 1);
			if (rand === 3) {
				player.sayL10n(l10n, 'PLAYER_ENTER');
			}
		}
	},
	playerDropItem: function (l10n)
	{
		return function (room, player, players)
		{
			players.broadcastAtL10n(player, l10n, 'PLAYER_DROP');
		}
	},
};
