exports.listeners = {
	playerLeave: function (l10n)
	{
		return function (player, players)
		{
			players.broadcastAtL10n(player, l10n, 'SLIDE', player.getName());
		}
	}
};
