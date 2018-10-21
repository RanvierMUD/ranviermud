'use strict';

const { Broadcast, Logger } = require('ranvier');

module.exports = {
  listeners: {
    spawn: state => function () {
      Broadcast.sayAt(this.room, "A rat scurries into view.");
      Logger.log(`Spawned rat into Room [${this.room.title}]`);
    },

    /**
     * Rat tries to use Rend every time it's available
     */
    updateTick: state => function () {
      if (!this.isInCombat()) {
        return;
      }

      const target = [...this.combatants][0];

      const rend = state.SkillManager.get('rend');
      // skills do both of these checks internally but I only want to send
      // this message when execute would definitely succeed
      if (!rend.onCooldown(this) && rend.hasEnoughResources(this)) {
        Broadcast.sayAt(target, "The rat bears its fangs and leaps at your throat!");
        rend.execute(null, this, target);
      }
    },

    deathblow: state => function (player) {
      Broadcast.sayAt(player.room, `The rat seems to snicker evilly as ${player.name} drops dead from their wounds.`);
    }
  }
};
