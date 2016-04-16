'use strict';
const util = require('util');

const Random = {
  coinFlip: _coinFlip,
  fromArray:  _fromArray,
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

exports.Random = Random;
