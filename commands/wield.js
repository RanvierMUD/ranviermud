'use strict';

const util = require('util');

const CommandUtil = require('../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/wield.yml';
const l10n = require('../src/l10n')(l10nFile);
const _ = require('../src/helpers');

exports.command = (rooms, items, players, npcs, Commands) => {

	return (args, player) => {
		let location = 'wield';

		const wielded = items.get(player.getEquipped(location));
		const offhand = items.get(player.getEquipped('offhand'));
		const canDual = player.getSkills('dual');

		const canHold = player.canHold();

		if (wielded && (offhand || !canDual)) {
		  return alreadyWielding();
		} else if (wielded && canDual && !offhand) {
		  if (!canHold) { return player.warn('Your hands are full already. You need to put something away first.'); }
		  location = 'offhand';
		}

		wield(location);

		function alreadyWielding() {
			const wieldedDesc = wielded.getShortDesc('en');

			const offhandDesc = getOffhandDesc(offhand, wielded);
			const adjective   = getAdjective(offhand, wielded);

			return player.say('You are already wielding ' + adjective + wieldedDesc + offhandDesc + '.');
		}


		function wield(location) {
			const target = _.firstWord(args);
			const weapon = CommandUtil.findItemInInventory(target, player, true);

			if (!weapon || !weapon.getAttribute('damage')) {
				return player.sayL10n(l10n, 'ITEM_NOT_FOUND');
			}

			util.log(player.getName() + ' ' + location + 's ' + weapon.getShortDesc('en'));

			const room = rooms.getAt(player.getLocation());
			weapon.emit('wield', location, room, player, players);

			player.equip(location, weapon);
		}

	};
};

// Helper functions to build strings //

const getOffhandDesc = (offhand, wielded) => {
	const offhandDesc = offhand.getShortDesc();
	if (offhand && offhandDesc === wielded.getShortDesc()) {
		return 's';
	} else if (offhand) {
		return	' and the ' + offhandDesc
	} else return '';
}

const getAdjective = (offhand, wielded) => {
	if (offhand && offhand === wielded) {
		return 'two ';
	} else if (offhand) {
		return 'both the ';
	} else return ' the';
}

////
