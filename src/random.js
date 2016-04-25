'use strict';
const util = require('util');

const Random = {

  coinFlip:   _coinFlip,
  fromArray:  _fromArray,
  roll:       _roll,

};

/**
 * @return 0 or 1
 */
function _coinFlip() {
  return Math.round(Math.random());
}


/**
 * @param Array arr
 * @return * from arr
 */
function _fromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Simulates rolling any number of any-sided dice.
 * Default: 1d20
 * @param   int Dice to be rolled
 * @param   int Sides per die
 * @return  int Result of roll
 */

function _roll(dice, sides) {
  dice = dice || 1;
  sides = sides || 20;
  return dice * (Math.floor(sides * Math.random()) + 1);
}

exports.Random = Random;
