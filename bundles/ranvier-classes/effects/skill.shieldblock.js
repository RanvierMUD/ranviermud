'use strict';

const { Broadcast, EffectFlag, Heal, Player } = require('ranvier');

module.exports = {
  config: {
    name: 'Shield Block',
    description: "You are blocking incoming physical attacks!",
    type: 'skill:shieldblock',
  },
  flags: [EffectFlag.BUFF],
  state: {
    magnitude: 1,
    type: "physical"
  },
  modifiers: {
    outgoingDamage: (damage, current) => current,
    incomingDamage: function (damage, currentAmount) {
      if (damage instanceof Heal || damage.attribute !== 'health') {
        return currentAmount;
      }

      const absorbed = Math.min(this.state.remaining, currentAmount);
      const partial = this.state.remaining < currentAmount ? ' partially' : '';
      this.state.remaining -= absorbed;
      currentAmount -= absorbed;

      Broadcast.sayAt(this.target, `You${partial} block the attack, preventing <bold>${absorbed}</bold> damage!`);
      if (!this.state.remaining) {
        this.remove();
      }

      return currentAmount;
    }
  },
  listeners: {
    effectActivated: function () {
      this.state.remaining = this.state.magnitude;

      if (this.target instanceof Player) {
        this.target.addPrompt('shieldblock', () => {
          const width = 60 - "Shield ".length;
          const remaining = `<b>${this.state.remaining}/${this.state.magnitude}</b>`;
          return "<b>Shield</b> " + Broadcast.progress(width, (this.state.remaining / this.state.magnitude) * 100, "white") + ` ${remaining}`;
        });
      }
    },

    effectDeactivated: function () {
      Broadcast.sayAt(this.target, 'You lower your shield, unable to block any more attacks.');
      if (this.target instanceof Player) {
        this.target.removePrompt('shieldblock');
      }
    }
  }
};
