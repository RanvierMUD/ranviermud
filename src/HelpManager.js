'use strict';

const util = require('util');

class HelpManager {
  constructor() {
    this.helps = new Map();
  }

  get(help) {
    return this.helps.get(help);
  }

  add(help) {
    this.helps.set(help.name, help);
  }

  /**
   * @param {string} search
   * @return {Help}
   */
  find(search) {
    const results = new Map();
    for (const [ name, help ] of this.helps.entries()) {
      if (name.indexOf(search) === 0) {
        results.set(name, help);
        continue;
      }
      if (help.keywords.some(keyword => keyword.includes(search))) {
        results.set(name, help);
      }
    }
    return results;
  }
}

module.exports = HelpManager;

