'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const l10nFile = __dirname + '/../l10n/commands/wield.yml';
const l10n = require('../src/l10n')(l10nFile);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
	return (args, player) => {
		const location = 'wield';
		const wield = player.getEquipped(location);
		if (wield) {
			player.sayL10n(l10n, 'CANT_WIELD', items.get(wield).getShortDesc(player.getLocale()));
			return;
		}

		let thing = args.split(' ')[0];
		thing = CommandUtil.findItemInInventory(thing, player, true);

		if (!thing) {
			player.sayL10n(l10n, 'ITEM_NOT_FOUND');
			return;
		}

		util.log(player.getName() + ' wields ' + thing.getShortDesc('en'));
		player.say('You wield the ' + thing.getShortDesc(player.getLocale()) + '.');
		thing.emit(location, location, player, players);
		player.equip(location, thing);
	};
};
