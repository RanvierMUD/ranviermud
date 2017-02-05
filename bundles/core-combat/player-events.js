'use strict';

/**
 * Auto combat module
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const LevelUtil = require(srcPath + 'LevelUtil');

  return  {
    listeners: {
      updateTick: state => function () {
        if (!this.isInCombat()) {
          return;
        }

        for (const target of this.combatants) {
          target.removeCombatant(this);
          this.removeCombatant(target);
        }
        Broadcast.sayAt(this, 'Ended combat!');
        Broadcast.prompt(this);
      }
    }
  };
};
