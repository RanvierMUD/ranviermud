"use strict";

const { Broadcast } = require("ranvier");
const say = Broadcast.sayAt;
const { roundState, combatOptions } = require("../lib/Combat.enums");

module.exports = {
  command: (state) => (arg, player) => {
    if (!player.isInCombat()) {
      return say(player, "You prepare to dodge! ... Against what?");
    }
    if (player.combatData.decision) {
      Broadcast.sayAt(player, "You're already prepared to dodge!");
      return;
    }

    if (player.combatData.round === roundState.PREPARE) {
      if (
        player.combatData.decision !== null &&
        player.combatData.decision !== combatOptions.DODGE
      ) {
        Broadcast.sayAt(player, "You change your mind...");
      }
      player.combatData.decision = combatOptions.STRIKE;
      Broadcast.sayAt(player, "You prepare to dodge!");
    }
  },
};
