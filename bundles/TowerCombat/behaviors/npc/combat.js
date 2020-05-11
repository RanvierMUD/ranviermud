'use strict';

const Combat = require('../../lib/Combat');

/**
 * Example real-time combat behavior for NPCs that goes along with the player's player-combat.js
 * Have combat implemented in a behavior like this allows two NPCs with this behavior to fight without
 * the player having to be involved
 */
module.exports = () => {
  return  {
    listeners: {
      /**
       * @param {*} config Behavior config
       */
      updateTick: state => function (config) {
        Combat.updateRound(state, this);
      },

      /**
       * NPC was killed
       * @param {*} config Behavior config
       * @param {Character} killer
       */
      killed: state => function (config, killer) {
      },

      /**
       * NPC hit another character
       * @param {*} config Behavior config
       * @param {Damage} damage
       * @param {Character} target
       */
      hit: state => function (config, damage, target) {
      },

      damaged: state => function (config, damage) {
        if (this.getAttribute('health') <= 0) {
          Combat.handleDeath(state, this, damage.attacker);
        }
      },

      /**
       * NPC killed a target
       * @param {*} config Behavior config
       * @param {Character} target
       */
      deathblow: state => function (config, target) {
        if (!this.isInCombat()) {
          Combat.startRegeneration(state, this);
        }
      }

      // refer to bundles/ranvier-combat/player-events.js for a further list of combat events
    }
  };
};
