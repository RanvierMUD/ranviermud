"use strict";

const IntraCommand = require("./IntraCommand");
const { light } = require("./configuration");

class Light extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
  }

  isInstanceOf(string) {
    return string.match(new RegExp(light.type, "gi"));
  }

  get config() {
    return {
      ...light,
    };
  }
}

module.exports = Light;
