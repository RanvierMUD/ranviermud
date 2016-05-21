'use strict';
const l10nFile = __dirname + '/../l10n/commands/save.yml';
const l10n = require('../src/l10n')(l10nFile);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
	return (args, player) => {
		player.save(() => {
			util.log("Saving ", player);
			player.sayL10n(l10n, 'SAVED');
		});
	};
};
