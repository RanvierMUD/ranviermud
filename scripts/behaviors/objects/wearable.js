const Broadcast = require('../../../src/broadcast').Broadcast;
const Effects   = require('../../../src/effects').Effects;

exports.listeners = {
	// TODO: Extract to file so that this functionality can be used for other items, and with special bonuses as well?
	// OR just add a bonus emitter -- might be too spaghetti though.

	wear: function (l10n) {
		return function (location, room, player, players) {
			const missedPrerequisites = this.checkPrerequisites(player);

			if (missedPrerequisites.length) {

				missedPrerequisites.forEach(prereq => {
					switch (prereq) {
						case 'stamina':
							const factor = player.getAttribute('stamina') / this.getPrerequisite('stamina'); //TODO: Extract
							player.say('You are not strong enough to wear this properly.');
							player.addEffect('encumbered_by_' + this.getShortDesc() + location, Effects.encumbered({ player, factor }));
							player.combat.addSpeedMod({
								name:   'encumbered_by_' + this.getShortDesc() + '_' + location,
								effect: speed => speed * factor //TODO: Extract
							});
							break;
						case 'quickness':
							const factor = player.getAttribute('quickness') / this.getPrerequisite('quickness');

							player.say('You are not quick enough to move about deftly in this.');
							player.combat.addDodgeMod({
								name:   'slowed_by_' + this.getShortDesc() + '_' + location, //TODO: Extract
								effect: dodge => dodge * factor
							});

							break;
						case 'cleverness':
							const factor = player.getAttribute('cleverness') / this.getPrerequisite('cleverness');

							player.say('You are not sure how to handle this piece of gear...');
							player.combat.addToHitMod({
								name: 'confused_by_' + this.getShortDesc() + '_' + location,
								effect: toHit => toHit * factor
							});

							break;
						case 'willpower':
							const factor = player.getAttribute('cleverness') / this.getPrerequisite('cleverness');

							player.say('You find yourself easily distracted as you don the ' + this.getShortDesc());
							player.combat.addDefenseMod({
								name: 'distracted_by_' + this.getShortDesc() + '_' + location,
								effect: defense => defense * factor
							});

							break;
						default:
							player.say('You have some trouble putting that on...');

					}
				});

			}

		  const toRoom = Broadcast.toRoom(room, player, null, players);
			const desc   = this.getShortDesc('en');
			const name   = player.getName();
			Broadcast.consistentMessage(toRoom, {
				firstPartyMessage: 'You wear the ' + desc + '.',
				thirdPartyMessage: name + ' wears the ' + desc + '.'
			});
		};
	},

	remove: function (l10n) {
		return function (location, room, player, players) {
			const toRoom = Broadcast.toRoom(room, player, null, players);
			const desc   = this.getShortDesc('en');
			const name   = player.getName();
			Broadcast.consistentMessage(toRoom, {
				firstPartyMessage: 'You remove the ' + desc + '.',
				thirdPartyMessage: name + ' removes the ' + desc + '.'
			});

			// Remove penalties that may have been added.
			player.removeEffect('encumbered_by_' + this.getShortDesc() + location);
			player.removeEffect('confused_by_' + this.getShortDesc() + location);

			player.combat.deleteAllMods('distracted_by_' + this.getShortDesc() + '_' + location);
			player.combat.deleteAllMods('encumbered_by_' + this.getShortDesc() + '_' + location);
			player.combat.deleteAllMods('slowed_by_' + this.getShortDesc() + '_' + location);
		};
	}
};
