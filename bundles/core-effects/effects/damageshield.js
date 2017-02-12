'use strict';

const util = require('util');

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const Player = require(srcPath + 'Player');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Damage Shield',
      description: "You are temporarily protected from damage!",
      type: 'shield',
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 50,
      remaining: 50,
      type: "physical"
    },
    modifiers: {
      outgoingDamage: damage => damage.finalAmount,
      incomingDamage: function (damage, currentAmount) {
        if (damage instanceof Heal || damage.attribute !== 'health') {
          return currentAmount;
        }

        const absorbed = Math.min(this.state.remaining, currentAmount);
        this.state.remaining -= absorbed;
        currentAmount -= absorbed;

        Broadcast.sayAt(this.target, `Your damage shield absorbs <bold>${absorbed}</bold> damage!`);
        if (!this.state.remaining) {
          this.remove();
        }

        return currentAmount;
      }
    },
    listeners: {
      eventActivated: function () {
        Broadcast.sayAt(this.target, `A shield of energy shield envelops you, protecting you from harm!`);

        if (this.target instanceof Player) {
          this.target.addPrompt("damageshield", () => {
            const width = 60 - "Shield".length;
            const remaining = `<bold>${this.state.remaining}/${this.state.magnitude}</bold>`;
            return "<bold>Shield:</bold> " + Broadcast.progress(width, (this.state.remaining / this.state.magnitude) * 100, "cyan") + ` ${remaining}`;
          });
        }
      },

      eventDeactivated: function () {
        Broadcast.sayAt(this.target, "The shield of energy around you dissipates.");
        if (this.target instanceof Player) {
          this.target.removePrompt("damageshield");
        }
      }
    }
  };
};
