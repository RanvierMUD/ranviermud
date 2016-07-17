'use strict';
const util = require('util');

const Random = {
  coinFlip,  inRange,
  fromArray, roll,
};

/**
 * @return 0 or 1
 */
function coinFlip() {
  return Math.round(Math.random());
}
/**
 * Integers only.
 * @param minimum #
 * @param maximum #
 * @return random # in range
 */
function inRange(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}


/**
 * @param Array arr
 * @return * from arr
 */
function fromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Simulates rolling any number of any-sided dice.
 * Default: 1d20
 * @param   int Dice to be rolled
 * @param   int Sides per die
 * @return  int Result of roll
 */

function roll(dice, sides) {
  dice = dice || 1;
  sides = sides || 20;
  return dice * (Math.floor(sides * Math.random()) + 1);
}

exports.Random = Random;
