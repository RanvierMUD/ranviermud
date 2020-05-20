"use strict";

const _ = require("lodash");
const IntraCommand = require("../../lib/intraRoundCommitments/IntraCommand");
const Engagement = require("../../lib/Engagement");

const handleIntraCmd = (target, character, commandType) => {
  const { decision: existingDecision } = character.combatData;
  const isIntraCommand = existingDecision instanceof IntraCommand;

  if (!character.isInCombat()) {
    character.emit("outOfCombatErr", commandType);
    return;
  }

  if (isIntraCommand) {
    if (existingDecision.isInstanceOf(commandType)) {
      character.emit("alreadyErr", commandType);
      return;
    }
    character.emit("commandSwitch");
  }
  if (!target) {
    target = Engagement.chooseCombatant(character);
  }
  character.emit("msgPrepareCmd", commandType);
  character.emit("prepareCmd", commandType, target);
};

module.exports = handleIntraCmd;
