"use strict";

const IntraCommand = require("./IntraCommand");
const { guard } = require("./configuration");
const { commandTypes } = require("./commands.enum");

class Guard extends IntraCommand {
  constructor(user, target) {
    super(user, target);
    this.user = user;
    this.target = target;
    this.elapsedRounds = 0;
    user.emit("newGuard", target);
  }

  isInstanceOf(string) {
    return string.match(new RegExp(guard.type, "gi"));
  }

  resolve(incomingAction) {
    const lightMitigationFactor = 0.9;
    const heavyMitigationFactor = 0.9;
    switch (incomingAction) {
      case commandTypes.LIGHT:
        incomingAction.mitigate(lightMitigationFactor);
        break;
      case commandTypes.HEAVY:
        incomingAction.mitigate(heavyMitigationFactor);
        break;
    }
    this.elapsedRounds++;
  }
  switch(nextAction) {
    if (this.elapsedRounds > 1 && nextAction.isInstanceOf(commandTypes.DODGE)) {
      nextAction.gainAdvantage();
    }
  }

  get config() {
    return {
      ...guard,
    };
  }
}

module.exports = Guard;
