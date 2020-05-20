"use strict";

const IntraCommand = require("./IntraCommand");
const { guard } = require("./configuration");

class Guard extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
  }

  isInstanceOf(string) {
    return string.match(new RegExp(guard.type, "gi"));
  }

  get config() {
    return {
      ...guard,
    };
  }
}

module.exports = Guard;
