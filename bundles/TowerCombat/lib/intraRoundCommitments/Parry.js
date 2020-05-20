"use strict";

const IntraCommand = require("./IntraCommand");
const { parry } = require("./configuration");

class Parry extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
  }

  isInstanceOf(string) {
    return string.match(new RegExp(parry.type, "gi"));
  }

  get config() {
    return {
      ...parry,
    };
  }
}

module.exports = Parry;
