'use strict';
const l10nFile = __dirname + '/../l10n/commands/describe.yml';
const l10n = require('../src/l10n')(l10nFile);
const util = require('util');
exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
  	if (args) {
      util.log(player.getName() + ' set their description to: \n', args);
  		player.setDescription(args);
  		player.sayL10n(l10n, 'DESCRIPTION_SET');
  	} else player.sayL10n(l10n, 'NO_DESCRIPTION', player.getDescription());
  }
};
