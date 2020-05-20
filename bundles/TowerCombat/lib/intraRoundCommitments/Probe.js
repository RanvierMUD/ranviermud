"use strict";

const IntraCommand = require("./IntraCommand");
const { probe } = require("./configuration");

class Probe extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
  }

  isInstanceOf(string) {
    return string.match(new RegExp(probe.type, "gi"));
  }

  get config() {
    return {
      ...probe,
    };
  }
}

module.exports = Probe;
