"use strict";

const IntraCommand = require("./IntraCommand");
const { heavy } = require("./configuration");

class Heavy extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
  }

  isInstanceOf(string) {
    return string.match(new RegExp(heavy.type, "gi"));
  }

  get config() {
    return {
      ...heavy,
    };
  }
}

module.exports = Heavy;
