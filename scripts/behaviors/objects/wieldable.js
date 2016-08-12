exports.listeners = {
	hit: function (l10n) {
		return function (room, attacker, defender, players, hitLocation, damageDealt) {
			checkForCrit(attacker, defender, damageDealt);
		}
	},
};

function checkForCrit(attacker, defender, damageDealt) {
	if (damageDealt > defender.getAttribute('max_health') * .5) {
		attacker.say('<bold><cyan>You have dealt a critical blow!</cyan><b/old>')
	}
}
