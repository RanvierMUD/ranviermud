'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/wield.yml';
const l10n = require('../src/l10n')(l10nFile);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
	return (args, player) => {
		let location = 'wield';
		const wield = player.getEquipped(location);

		if (wield && (!player.getSkills('dual') || player.getEquipped('offhand'))) {
			player.sayL10n(l10n, 'CANT_WIELD', items.get(wield).getShortDesc(player.getLocale()));
			return;
		} else if (player.getSkills('dual')) {
		  location = 'offhand';
		}

		wield(location);

		function wield(location) {
			let weapon = args.split(' ')[0];
			weapon = CommandUtil.findItemInInventory(weapon, player, true);

			if (!weapon) {
				player.sayL10n(l10n, 'ITEM_NOT_FOUND');
				return;
			}

			util.log(player.getName() + ' wields ' + weapon.getShortDesc('en'));
			player.say('You wield the ' + weapon.getShortDesc(player.getLocale()) + '.');
			weapon.emit(location, location, player, players);
			player.equip(location, weapon);
		}
	};
};
