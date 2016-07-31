exports.listeners = {

  wield: function (l10n) {
    return function (location, player, players) {
      player.say('You ready the weighty cleaver.');
      player.combat.addToHitMod({
        name: 'cleaver ' + this.getUuid(),
        effect: toHit => toHit + 1
      });
    }
  },

  remove: function (l10n) {
    return function (player) {
      player.say('You place the bulky cleaver in your pack.');
      player.combat.deleteAllMods('cleaver' + this.getUuid());
    }
  },

  hit: function (l10n) {
		return function (player) {
			player.say('<bold>The blade of your cleaver <red>does its job.</red></bold>');
      player.combat.addDamageMod({
        name: 'cleaver' + this.getUuid(),
        effect: damage => damage + .5
      });
		}
	}
};
