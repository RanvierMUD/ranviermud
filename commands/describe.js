var l10n_file = __dirname + '/../l10n/commands/describe.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function(rooms, items, players, npcs, Commands) {
  return function(args, player) {
  	if (args) {
  		player.setDescription(args);
  		player.sayL10n(l10n, 'DESCRIPTION_SET');
  	} else player.sayL10n(l10n, 'NO_DESCRIPTION', player.getDescription());
  	return;
  }
};