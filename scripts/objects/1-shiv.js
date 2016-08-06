const Random = require('../../src/random').Random;
const Broadcast = require('../../src/broadcast').Broadcast;

exports.listeners = {

	wield: function (l10n) {
		return function (location, player, players) {
			const toRoom = Broadcast.toRoom(player, null, players);

			const firstPartyMessage = '<yellow>You clench the shiv tightly in your fist.</yellow>';
			const thirdPartyMessage = '<yellow>' + player.getShortDesc() + ' draws and clenches a shiv tightly.</yellow>'
			toRoom({ firstPartyMessage, thirdPartyMessage });

			//TODO: Test to make sure this gets removed on quit.
			const uid = this.getUuid();
			player.combat.addDodgeMod({
				name: 'shiv' + id,
				effect: dodge => dodge + 1
			});
		}
	},

	remove: function (l10n) {
		return function (room, player, players) {
			const toRoom = Broadcast.toRoom(room, player, null, players);

			const firstPartyMessage = '<yellow>You clench the shiv tightly in your fist.</yellow>';
			const thirdPartyMessage = '<yellow>' + player.getShortDesc() + ' draws and clenches a shiv tightly.</yellow>'
			toRoom({ firstPartyMessage, thirdPartyMessage });

			//TODO: Test to make sure this gets removed on quit.
			const uid = this.getUuid();
			player.combat.addDodgeMod({
				name: 'shiv' + id,
				effect: dodge => dodge + 1
			});
			player.say('You carefully stow the shiv away, avoiding the rusty blade.');

			const uid = this.getUuid();
			player.combat.removeDodgeMod('shiv' + uid);
		}
	},

	hit: function (l10n) {
		return function (room, attacker, defender, players, hitLocation, damage) {
			const msg = Random.fromArray([
				'Your shank finds purchase in flesh.',
				'You nimbly dart forth and knick your opponent.',
				'You dash and slash, crimson spraying in miniature fountains.'
			]);
			player.say('<bold>' + msg + '</bold>');
		}
	},

	parry: function(l10n) {
		return function(player) {
			player.say('You deftly knock your opponent\'s strike away with the point of your blade.');
		}
	},

};
