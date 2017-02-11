'use strict';

/**
 * Until I find a good random library this is here to at least be a single place
 * to implement the real random lib
 */
class RandomUtil {
  static range(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = RandomUtil;
