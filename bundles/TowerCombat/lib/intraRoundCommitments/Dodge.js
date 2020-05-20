"use strict";

const IntraCommand = require("./IntraCommand");
const { dodge } = require("./configuration");

class Dodge extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
  }

  isInstanceOf(string) {
    return string.match(new RegExp(dodge.type, "gi"));
  }

  get config() {
    return {
      ...dodge,
    };
  }
}

module.exports = Dodge;
