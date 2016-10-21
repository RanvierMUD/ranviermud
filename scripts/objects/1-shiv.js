const Random = require('../../src/random').Random;
const Broadcast = require('../../src/broadcast').Broadcast;
const ItemUtil  = require('../../src/item_util').ItemUtil;

const util = require('util');

exports.listeners = {

	//TODO: Update to account for prereqs
	wield: function (l10n) {
		return function (location, room, player, players) {
			const toRoom = Broadcast.toRoom(room, player, null, players);

			const firstPartyMessage = '<yellow>You clench the shiv tightly in your fist.</yellow>';
			const thirdPartyMessage = '<yellow>' + player.getShortDesc('en') + ' draws and clenches a shiv tightly.</yellow>'
			toRoom({ firstPartyMessage, thirdPartyMessage });

			const missedPrerequisites = this.checkPrerequisites(player);
			ItemUtil.useDefaultPenalties(this, player, location, missedPrerequisites, 'wield');

			if (!missedPrerequisites.length) {
				player.warn('You artful dodger, you...');
				const dodgeBonus = Math.max(Math.min((player.getAttribute('level') / 2), 2), 10);
				const id = this.getUuid();
				player.combat.addDodgeMod({
					name: 'shiv' + id,
					effect: dodge => dodge + dodgeBonus //TODO: Change to use slicey weapon skill?
				});
			}

		}
	},

	remove: function (l10n) {
		return function (location, room, player, players) {
			const toRoom = Broadcast.toRoom(room, player, null, players);

			const firstPartyMessage = '<yellow>You carefully stow the shiv away, avoiding the rusty blade.</yellow>';
			const thirdPartyMessage = '<yellow>' + player.getShortDesc('en') + ' carefully stows away their rusty shiv.</yellow>'
			toRoom({ firstPartyMessage, thirdPartyMessage });

			ItemUtil.removeDefaultPenaltes(player, this, location);

			const uid = this.getUuid();
			player.combat.removeDodgeMod('shiv' + uid);
		}
	},

	hit: function (l10n) {
		return function (room, attacker, defender, players, hitLocation, damage) {
			const toRoom = Broadcast.toRoom(room, attacker, null, players);

			const firstPartyMessage = [
				'Your shank finds purchase in <red>flesh</red>.',
				'You nimbly dart forth and <red>knick</red> your opponent.',
				'You dash and slash, <red>crimson</red> spraying in miniature fountains.'
			].map(msg => '<bold>' + msg + '</bold>');

			const thirdPartyMessage = [
				attacker.getShortDesc('en') + '\'s shank finds purchase in ' + defender.getShortDesc('en') + '\'s flesh.',
				attacker.getShortDesc('en') + ' nimbly darts forth and knicks ' + defender.getShortDesc('en') + '.',
				attacker.getShortDesc('en') + ' dashes in and slashes,' + defender.getShortDesc('en') + ', crimson spraying in miniature fountains.'
			].map(msg => '<bold>' + msg + '</bold>');

			Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });
		}
	},

	parry: function(l10n) {
		return function(room, player, attacker, players) {
			const toRoom = Broadcast.toRoom(room, player, null, players);

			const firstPartyMessage = ['You deftly knock ' + attacker.getShortDesc('en') + '\'s strike away with the point of your blade.']
				.map(msg => '<white>' + msg + '</white>');
			const thirdPartyMessage = [player.getShortDesc('en') + ' somehow manages to knock away ' + attacker.getShortDesc('en') + '\'s attack with their tiny blade!']
				.map(msg => '<white>' + msg + '</white>');

			Broadcast.consistentMessage(toRoom, { firstPartyMessage, thirdPartyMessage });
		}
	},

};
