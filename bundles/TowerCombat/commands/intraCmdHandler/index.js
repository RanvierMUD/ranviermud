'use strict'

const _ = require("lodash");
const IntraCommand = require('../../lib/intraRoundCommitments/IntraCommand')

const handleIntraCmd = (arg, character, commandType) => {
  const { decision: characterDecision } = character.combatData;
  const decDefinedAsIntraCommand = characterDecision instanceof IntraCommand

  if (!character.isInCombat()) {
    character.emit("outOfCombatErr", commandType);
    return;
  }

  if (decDefinedAsIntraCommand) {
    if (characterDecision.isInstanceOf(commandType)) {
      character.emit("alreadyErr", commandType);
      return;
    }
    character.emit("commandSwitch");
  }

  character.emit("msgPrepareCmd", commandType);
  character.emit("prepareCmd", commandType);
};

module.exports = handleIntraCmd;
