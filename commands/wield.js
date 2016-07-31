'use strict';

const util = require('util');

const CommandUtil = require('../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/wield.yml';
const l10n = require('../src/l10n')(l10nFile);
const _ = require('../src/helpers');

exports.command = (rooms, items, players, npcs, Commands) => {
	return (args, player) => {
		let location = 'wield';
		const wielded = player.getEquipped(location);
		util.log(wielded);
		const offhand = player.getEquipped('offhand');
		const canDual = player.getSkills('dual');

		if (wielded && (offhand || !canDual)) {
			return player.sayL10n(l10n, 'CANT_WIELD', items.get(wielded).getShortDesc(player.getLocale()));
		} else if (wielded && canDual && !offhand) {
		  location = 'offhand';
		}

		wield(location);

		function wield(location) {
			let weapon = _.firstWord(args);
			weapon = CommandUtil.findItemInInventory(weapon, player, true);

			if (!weapon || !weapon.getAttribute('damage')) {
				player.sayL10n(l10n, 'ITEM_NOT_FOUND');
				return;
			}

			util.log(player.getName() + ' ' + location + ' wields ' + weapon.getShortDesc('en'));

			if (CommandUtil.hasScript(weapon, 'wield')) {
				weapon.emit('wield', location, player, players);
			} else {
				player.say('You wield the ' + weapon.getShortDesc(player.getLocale()) + '.');
			}

			player.equip(location, weapon);
		}
	};
};
