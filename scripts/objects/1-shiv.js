const Random = require('../../src/random').Random;
const Broadcast = require('../../src/broadcast').Broadcast;

exports.listeners = {

	wield: function (l10n) {
		return function (location, player, players) {
			const toRoom = Broadcast.toRoom(player, null, players);
			const firstPartyMessage = '<yellow>You clench the shiv tightly in your fist.</yellow>';
			player.say('<yellow>You clench the shiv tightly in your fist.</yellow>');
			player.equip(location, this);
			player.combat.addDodgeMod({
				name: 'shiv' + this.getUuid(),
				effect: dodge => dodge + 1
			});
		}
	},

	remove: function (l10n) {
		return function (player) {
			player.say('You carefully stow the shiv away, avoiding the rusty blade.');
			player.combat.removeDodgeMod('shiv' + this.getUuid());
		}
	},

	hit: function (l10n) {
		return function (player) {
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
