var CommandUtil = require('../src/command_util').CommandUtil;
var l10n_file = __dirname + '/../l10n/commands/appraise.yml';
var l10n = new require('localize')(require('js-yaml').load(require('fs').readFileSync(l10n_file).toString('utf8')), undefined, 'zz');
exports.command = function (rooms, items, players, npcs, Commands)
{
	
	function getRelativeLevel(player, target){
		var difference = player - target;
		if (difference < -3){
			return 'TARGET_MUCH_STRONGER';
		} else if (difference < -1){
			return 'TARGET_STRONGER';
		} else if (difference > 3){
			return 'TARGET_MUCH_WEAKER';
		} else if (difference > 1){
			return 'TARGET_WEAKER';
		} else if (difference === 0){
			return 'TARGET_SAME_LEVEL'
		} else
			return 'MISSING_INFORMATION'
	}
	
	return function (args, player)
	{
		if (player.isInCombat()) {
			player.sayL10n(l10n, 'APPRAISE_COMBAT');
			return;
		}

		var room = rooms.getAt(player.getLocation());
		var target = CommandUtil.findNpcInRoom(npcs, args, room, player, true);

		console.log(target);
		if (!target){
			player.sayL10n(l10n, 'TARGET_NOT_FOUND');
			return;
		}

		var targetLevel = target.getAttribute(level) || null;
		var playerLevel = player.getAttribute(level) || null;
		var targetName = target.getShortDesc() || null;

		if (targetLevel && playerLevel && targetName) {
			player.sayL10n(l10n, getRelativeLevel(playerLevel, targetLevel), targetName);
			return;
		}

		player.sayL10n(l10n, 'MISSING_INFORMATION');
		return;

	}
};
