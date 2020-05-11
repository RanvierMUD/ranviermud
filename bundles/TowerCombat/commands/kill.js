'use strict';

const Ranvier = require('ranvier');
const B = Ranvier.Broadcast;
const Logger = Ranvier.Logger;

const Combat = require('../lib/Combat');
const CombatErrors = require('../lib/CombatErrors');

module.exports = {
  aliases: ['attack', 'slay'],
  command : (state) => (args, player) => {
    args = args.trim();

    if (!args.length) {
      return B.sayAt(player, 'Kill whom?');
    }

    let target = null;
    try {
      target = Combat.findCombatant(player, args);
    } catch (e) {
      if (
        e instanceof CombatErrors.CombatSelfError ||
        e instanceof CombatErrors.CombatNonPvpError ||
        e instanceof CombatErrors.CombatInvalidTargetError ||
        e instanceof CombatErrors.CombatPacifistError
      ) {
        return B.sayAt(player, e.message);
      }

      Logger.error(e.message);
    }

    if (!target) {
      return B.sayAt(player, "They aren't here.");
    }

    B.sayAt(player, `You attack ${target.name}.`);

    player.initiateCombat(target);
    B.sayAtExcept(player.room, `${player.name} attacks ${target.name}!`, [player, target]);
    if (!target.isNpc) {
      B.sayAt(target, `${player.name} attacks you!`);
    }
  }
};
