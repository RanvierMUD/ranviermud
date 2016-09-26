const Broadcast = require('../../../src/broadcast').Broadcast;
exports.listeners = {
	wear: function (l10n) {
		return function (location, room, player, players) {
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
