const Broadcast = require('../../../src/broadcast').Broadcast;
const Effects   = require('../../../src/effects').Effects;

exports.listeners = {
	wear: function (l10n) {
		return function (location, room, player, players) {
			const missedPrerequisites = this.checkPrerequisites(player);

			if (missedPrerequisites.length) {

				missedPrerequisites.forEach(prereq => {
					switch(prereq) {
						case 'stamina':
							const factor = player.getAttribute('stamina') / this.getPrerequisite('stamina');
							player.say('You are not strong enough to wear this properly.');
							player.addEffect('encumbered_by_' + this.getShortDesc(), Effects.encumbered({ player, factor }));
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
		return function (room, player, players) {
			console.log(this);
			const toRoom = Broadcast.toRoom(room, player, null, players);
			const desc   = this.getShortDesc('en');
			const name   = player.getName();
			Broadcast.consistentMessage(toRoom, {
				firstPartyMessage: 'You remove the ' + desc + '.',
				thirdPartyMessage: name + ' removes the ' + desc + '.'
			});
		};
	}
};
