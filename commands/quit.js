'use strict';
const l10n_file = __dirname + '/../l10n/commands/quit.yml';
const l10n = require('../src/l10n')(l10n_file);
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) => {
	return (args, player) => {
		const playerName = player.getName();

		if (player.isInCombat()) {
			util.log(playerName + ' tried to quit during combat.');
			player.sayL10n(l10n, 'COMBAT_COMMAND_FAIL');
			return;
		}

		util.log(playerName + ' has quit.');
		player.emit('quit');
		player.save(() => players.removePlayer(player, true));
		return false; //TODO: Why? Consider returning true if they do quit, otherwise false.
	};
};
