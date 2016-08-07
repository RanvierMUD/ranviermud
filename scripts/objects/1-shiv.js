const Random = require('../../src/random').Random;
const Broadcast = require('../../src/broadcast').Broadcast;
const util = require('util');

exports.listeners = {

	wield: function (l10n) {
		return function (location, room, player, players) {
			const toRoom = Broadcast.toRoom(room, player, null, players);

			const firstPartyMessage = '<yellow>You clench the shiv tightly in your fist.</yellow>';
			const thirdPartyMessage = '<yellow>' + player.getShortDesc() + ' draws and clenches a shiv tightly.</yellow>'
			toRoom({ firstPartyMessage, thirdPartyMessage });

			//TODO: Test to make sure this gets removed on quit.
			const id = this.getUuid();
			player.combat.addDodgeMod({
				name: 'shiv' + id,
				effect: dodge => dodge + 1
			});
		}
	},

	remove: function (l10n) {
		return function (room, player, players) {
			const toRoom = Broadcast.toRoom(room, player, null, players);

			const firstPartyMessage = '<yellow>You carefully stow the shiv away, avoiding the rusty blade.</yellow>';
			const thirdPartyMessage = '<yellow>' + player.getShortDesc() + ' carefully stows away their rusty shiv.</yellow>'
			toRoom({ firstPartyMessage, thirdPartyMessage });

			//TODO: Test to make sure this gets removed on quit.
			const id = this.getUuid();
			player.combat.addDodgeMod({
				name: 'shiv' + id,
				effect: dodge => dodge + 1
			});

			const uid = this.getUuid();
			player.combat.removeDodgeMod('shiv' + uid);
		}
	},

	hit: function (l10n) {
		return function (room, attacker, defender, players, hitLocation, damage) {
			const toRoom = Broadcast.toRoom(room, attacker, null, players);

			const firstPartyMessage = [
				'Your shank finds purchase in flesh.',
				'You nimbly dart forth and knick your opponent.',
				'You dash and slash, crimson spraying in miniature fountains.'
			].map(msg => '<bold>' + msg + '</bold>');

			const thirdPartyMessage = [
				attacker.getShortDesc() + '\'s shank finds purchase in ' + defender.getShortDesc() + '\'s flesh.',
				attacker.getShortDesc() + ' nimbly darts forth and knicks ' + defender.getShortDesc() + '.',
				attacker.getShortDesc() + ' dashes in and slashes,' + defender.getShortDesc() + ', crimson spraying in miniature fountains.'
			].map(msg => '<bold>' + msg + '</bold>');

			util.log('======emitting hit thing stuff for shiv');

			Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });
		}
	},

	parry: function(l10n) {
		return function(room, player, attacker, players) {
			const toRoom = Broadcast.toRoom(room, player, null, players);

			const firstPartyMessage = ['You deftly knock ' + attacker.getShortDesc() + '\'s strike away with the point of your blade.']
				.map(msg => '<white>' + msg + '</white>');
			const thirdPartyMessage = [player.getShortDesc() + ' somehow manages to knock away ' + attacker.getShortDesc() + '\'s attack with their tiny blade!']
				.map(msg => '<white>' + msg + '</white>');

			Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });
		}
	},

};
