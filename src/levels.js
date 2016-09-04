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
	switch (true) {
		case (level <= 5):
			return 0;
		case (level <= 10):
			return 2;
		case (level >= 15):
			return 4;
		case (level >= 20):
			return 6;
		case (level >= 32):
			return 5 + level - 30;
	}
};

/**
 * Get the exp that a mob gives
 * @param int level
 * @return int
 */
const mobExp = level => 45 + (5 * level);

/**
 * Get the amount of 'hours' a PC can train skills after levelup
 * @param int Player level
 * @return number of times they may train skills.
 */
const getTrainingTime = level => Math.floor(level / 4 + 1);

const getMutagenGain = level => {
	const gainedMutagen = level % 2 === 0;
 	return gainedMutagen ?
		Math.ceil(level / 10) :
		0;
};


/**
 * Helper to get the amount of experience a player needs to level
 * @param int level Target level
 * @return int
 */
const expToLevel = level =>
	((2 * level) + diff(level)) * mobExp(level) * reduction(level);


exports.LevelUtil = {
	getMutagenGain,
	expToLevel,
	mobExp,
	getTrainingTime,
};
