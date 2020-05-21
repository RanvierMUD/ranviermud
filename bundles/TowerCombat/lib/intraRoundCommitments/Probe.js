"use strict";

const IntraCommand = require("./IntraCommand");
const { probe } = require("./configuration");
const { commandTypes } = require("./commands.enum");
const Random = require("rando-js");

class Probe extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
  }

  isInstanceOf(string) {
    return string.match(new RegExp(probe.type, "gi"));
  }

  resolve(incomingAction) {
    this.elapsedRounds++;
    if (this.elapsedRounds > 1) {
      this.rollAdvantageChance();
    }
  }

  switch(nextAction) {
    if (this.elapsedRounds > 1 && nextAction.isInstanceOf(commandTypes.DODGE)) {
      nextAction.gainAdvantage();
    }
  }

  rollAdvantageChance() {
    if (Random.inRange(0, 10) === 10) {
      this.user.emit("probeGainAdvantage", this.target);
    }
  }

  get config() {
    return {
      ...probe,
    };
  }
}

module.exports = Probe;
