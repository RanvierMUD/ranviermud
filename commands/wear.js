// wear.js

var CommandUtil = require('../src/command_util').CommandUtil;
var l10n_file = __dirname + '/../l10n/commands/wear.yml';
var l10n = require('../src/l10n')(l10n_file);

exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		var wear = player.getEquipped('wear');
		if (wear) {
			player.sayL10n(l10n, 'CANT_WEAR', items.get(wear).getShortDesc(player.getLocale()));
			return;
		}
		var thing = args.split(' ')[0];
		thing = CommandUtil.findItemInInventory(thing, player, true);
		if (!thing) {
			player.sayL10n(l10n, 'ITEM_NOT_FOUND');
			return;
		}
		thing.emit('wear', 'wear', player, players);
	};
};