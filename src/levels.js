/**
 * These formulas are stolen straight from WoW.
 * See: http://www.wowwiki.com/Formulas:XP_To_Level
 */

var reduction = function (level)
{
	var val;
	switch (true)
	{
	case (level <= 10):
		val = 1;
		break;
	case (level >= 11 && level <= 27):
		val = 1 - (level - 10) / 100;
		break;
	case (level >= 28 && level <= 59):
		val = .82;
		break;
	default:
		val = 1;
	}
	return val;
};

/**
 * Difficulty modifier
 * @param int level
 * @return int
 */
var diff = function (level)
{
	var val;
	switch (true)
	{
	case (level <= 28):
		val = 0;
		break;
	case (level === 29):
		val = 1;
		break;
	case (level === 30):
		val = 3;
		break;
	case (level === 31):
		val = 6;
		break;
	case (level >= 32):
		val = 5 * level - 30;
		break;
	}
	return val;
};

/**
 * Get the exp that a mob gives
 * @param int level
 * @return int
 */
var mob_exp = function (level)
{
	return 45 + (5 * level);
};

/**
 * Helper to get the amount of experience a player needs to level
 * @param int level Target level
 * @return int
 */
var level_exp_formula = function (level)
{
	return ((8 * level) + diff(level)) * mob_exp(level) * reduction(level);
};

exports.LevelUtil = {
	expToLevel: function (level)
	{
		return level_exp_formula(level);
	},
	mobExp: function (level)
	{
		return mob_exp(level);
	}
};
