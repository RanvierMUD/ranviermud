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
    for (const [ name, help ] of this.helps.entries()) {
      if (name.indexOf(search) === 0) {
        return help;
      }
    }
  }
}

module.exports = HelpManager;

