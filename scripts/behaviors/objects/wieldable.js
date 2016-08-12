exports.listeners = {
	hit: function (l10n) {
		return function (room, attacker, defender, players, hitLocation, damageDealt) {
			if (damageDealt > defender.getAttribute('max_health') * .5) {
				attacker.say('<bold><cyan>You have dealt a critical blow!</cyan><b/old>')
			}
		}
	},
};
