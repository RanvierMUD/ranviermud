'use strict';

const Combat = require('../lib/Combat');
const CombatErrors = require('../lib/CombatErrors');
const { Broadcast: B, Logger } = require('ranvier');

module.exports = {
  usage: 'consider <target>',
  command: state => (args, player) => {
    if (!args || !args.length) {
      return B.sayAt(player, 'Who do you want to size up for a fight?');
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
      return B.sayAt(player, 'They aren\'t here.');
    }

    let description = '';
    switch (true) {
      case (player.level  - target.level > 4):
        description = 'They are much weaker than you. You would have no trouble dealing with a few of them at once.';
        break;
      case (target.level - player.level > 9):
        description = 'They are <b>much</b> stronger than you. They will kill you and it will hurt the whole time you\'re dying.';
        break;
      case (target.level - player.level > 5):
        description = 'They are quite a bit more powerful than you. You would need to get lucky to defeat them.';
        break;
      case (target.level - player.level > 3):
        description = 'They are a bit stronger than you. You may survive but it would be hard won.';
        break;
      default:
        description = 'You are nearly evenly matched. You should be wary fighting more than one at a time.';
        break;
    }

    B.sayAt(player, description);
  }
};
