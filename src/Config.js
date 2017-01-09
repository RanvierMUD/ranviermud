'use strict';

const Data = require('./Data');

let __cache = null;

class Config {
  static get(key, fallback) {
    if (!__cache) {
      Config.load();
    }

    return key in __cache ? __cache[key] : fallback;
  }

  static set(key, val) {
    if (!__cache) {
      Config.load();
    }

    __cache[key] = val;
  }

  static load() {
    __cache = Data.parseFile(__dirname + '/../ranvier.json');
  }
}

module.exports = Config;
