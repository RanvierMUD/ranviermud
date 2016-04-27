'use strict';
const CommandUtil = require('../src/command_util').CommandUtil;
const l10n_file = __dirname + '/../l10n/commands/wield.yml';
const l10n = require('../src/l10n')(l10n_file);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
	return (args, player) => {
		const wield = player.getEquipped('wield');
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

		util.log(player.getName() + ' wields ' + item.getShortDesc('en'));
		thing.emit('wield', 'wield', player, players);
	};
};
