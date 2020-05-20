"use strict";

const IntraCommand = require("./IntraCommand");
const { strike } = require("./configuration");

class Strike extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
  }

  isInstanceOf(string) {
    return string.match(new RegExp(strike.type, "gi"));
  }

  get config() {
    return {
      ...strike,
    };
  }
}

module.exports = Strike;
