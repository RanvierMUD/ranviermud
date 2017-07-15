'use strict';

const Data = require('./Data');

let __cache = null;

/**
 * Access class for the `ranvier.json` config
 */
class Config {
  /**
   * @param {string} key
   * @param {*} fallback fallback value
   */
  static get(key, fallback) {
    if (!__cache) {
      Config.load();
    }

    return key in __cache ? __cache[key] : fallback;
  }

  /**
   * @param {string} key
   * @param {*} val
   */
  static set(key, val) {
    if (!__cache) {
      Config.load();
    }

    __cache[key] = val;
  }

  /**
   * @return {Object}
   */
  static getAll() {
    if (!__cache) {
      Config.load();
    }

    return __cache;
  }

  /**
   * Load `ranvier.json` from disk
   */
  static load() {
    __cache = Data.parseFile(__dirname + '/../ranvier.json');
  }

  /**
   * Persist changes to config to disk
   * @param {Object} config
   */
  static save(config) {
    config = Object.assign(this.getAll(), config);
    Data.saveFile(__dirname + '/../ranvier.json', config);
  }
}

module.exports = Config;
