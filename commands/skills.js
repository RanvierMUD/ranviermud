var Skills = require('../src/skills').Skills;
var l10n_file = __dirname + '/../l10n/commands/skills.yml';
var l10n = require('../src/l10n')(l10n_file);

exports.command = function (rooms, items, players, npcs, Commands)
{
	return function (args, player)
	{
		var skills = player.getSkills();
		for (var sk in skills) {
			var skill = Skills[player.getAttribute('class')][sk];
			player.say("<yellow>" + skill.name + "</yellow>");

			player.write("  ");
			player.sayL10n(l10n, "SKILL_DESC", skill.description);
			if (typeof skill.cooldown !== "undefined") {
				player.write("  ");
				player.sayL10n(l10n, "SKILL_COOLDOWN", skill.cooldown);
			}
			player.say("");
		}
	};
};
