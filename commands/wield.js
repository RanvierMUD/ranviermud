'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/wield.yml';
const l10n = require('../src/l10n')(l10nFile);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
	return (args, player) => {
		let location = 'wield';
		const wielded = player.getEquipped(location);
		const offhand = player.getEquipped('offhand')
		const canDual = player.getSkills('dual')

		if (wielded && offhand && !canDual) {
			player.sayL10n(l10n, 'CANT_WIELD', items.get(wielded).getShortDesc(player.getLocale()));
			return;
		} else if (wielded && canDual && !offhand) {
		  location = 'offhand';
		}

		util.log(location);
		wield(location);

		function wield(location) {
			let weapon = args.split(' ')[0];
			weapon = CommandUtil.findItemInInventory(weapon, player, true);

			if (!weapon) {
				player.sayL10n(l10n, 'ITEM_NOT_FOUND');
				return;
			}

			util.log(player.getName() + ' ' + location + ' wields ' + weapon.getShortDesc('en'));
			player.say('You wield the ' + weapon.getShortDesc(player.getLocale()));
			weapon.emit(location, location, player, players);
			player.equip(location, weapon);
		}
	};
};
