'use strict';

/**
* These formulas are stolen straight from WoW.
* See: http://www.wowwiki.com/Formulas:XP_To_Level
*/

/**
 * Extra difficulty factor to level
 * @param {number} level
 * @private
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
      val = 0.82;
      break;
    default:
      val = 1;
  }
  return val;
};

/**
 * Difficulty modifier starting around level 30
 * @param int level
 * @return int
 * @private
*/
const diff = level => {
  switch (true) {
    case (level <= 28):
      return 0;
    case (level === 29):
      return 1;
    case (level === 30):
      return 3;
    case (level === 31):
      return 6;
    case (level >= 32):
    case (level <= 59):
      return 5 * (level - 30);
  }
};

/**
 * @namespace
 */
const LevelUtil = {
/**
 * Get the exp that a mob gives
 * @param int level
 * @return int
 */
  mobExp: level => 45 + (5 * level),

  /**
   * Helper to get the amount of experience a player needs to level
   * @param int level Target level
   * @return int
   * @memberof! LevelUtil
   */
  expToLevel: level => Math.floor(((4 * level) + diff(level)) * LevelUtil.mobExp(level) * reduction(level)),
};

module.exports = LevelUtil;
