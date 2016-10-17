'use strict';
const LevelUtil = require('../../../src/levels').LevelUtil;


exports.listeners = {
	hit: function (l10n) {
		return function (room, attacker, defender, players, hitLocation, damageDealt) {
			checkForCrit(attacker, defender, damageDealt);
		}
	},

};

function checkForCrit(attacker, defender, damageDealt) {
	var defenderHealth    = defender.getAttribute('health');
	var defenderMaxHealth = defender.getAttribute('max_health');

	var massiveDamage = damageDealt > defenderMaxHealth * .5;
	var almostDead  = defenderHealth <= defenderMaxHealth * .2;
	var coupDeGrace = almostDead && damageDealt >= defenderHealth;

	if (massiveDamage || coupDeGrace) {
		attacker.say('<bold><cyan>You have dealt a critical blow!</cyan></bold>');
	}
}
