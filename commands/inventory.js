var l10n_file = __dirname + '/../l10n/commands/inventory.yml';
var l10n = require('../src/l10n')(l10n_file);
exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		player.sayL10n(l10n, 'INV');

		// See how many of an item a player has so we can do stuff like (2) apple
		var itemcounts = {};
		player.getInventory().forEach(function (i) {
			if (!i.isEquipped()) {
				itemcounts[i.getVnum()] ? itemcounts[i.getVnum()] += 1 : itemcounts[i.getVnum()] = 1;
			}
		});

		var displayed = {};
		player.getInventory().forEach(function (i) {
			if (!(i.getVnum() in displayed) && !i.isEquipped()) {
				displayed[i.getVnum()] = 1;
				player.say((itemcounts[i.getVnum()] > 1 ? '(' + itemcounts[i.getVnum()] + ') ' : '') + i.getShortDesc(player.getLocale()));
			}
		});
	};
};
