'use strict';
const util = require('util');

/**
 * These formulas are stolen straight from WoW.
 * See: http://www.wowwiki.com/Formulas:XP_To_Level
 */

const reduction = level => {
	let val;
	switch (true) {
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
const diff = level => {
	let val;
	switch (true) {
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
const mob_exp = level => 45 + (5 * level);

/**
 * Get the amount of 'hours' a PC can train skills after levelup
 * @param int Player level
 * @return number of times they may train skills.
 */
const training = level => Math.floor(level / 4 + 1);


/**
 * Helper to get the amount of experience a player needs to level
 * @param int level Target level
 * @return int
 */
const level_exp_formula = level =>
	((8 * level) + diff(level)) * mob_exp(level) * reduction(level);

exports.LevelUtil = {
	expToLevel: level_exp_formula,
	mobExp: mob_exp,
	getTrainingTime: training,
};
