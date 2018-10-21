'use strict';

const { Broadcast, Heal, SkillType } = require('ranvier');

/**
 * Health potion item spell
 */
module.exports = {
  name: 'Potion',
  type: SkillType.SPELL,
  requiresTarget: true,
  targetSelf: true,

  run: state => function (args, player) {
    const restorePercent = this.options.restore || 0;
    const stat = this.options.stat || 'health';
    const heal = new Heal({
      attribute: stat,
      amount: Math.round(player.getMaxAttribute('health') * (this.options.restores / 100)),
      attacker: player,
      source: this
    });

    Broadcast.sayAt(player, `<bold>You drink the potion and a warm feeling fills your body.</bold>`);
    heal.commit(player);
  },

  info: function (player) {
    return `Restores <b>${this.options.restores}%</b> of your total ${this.options.stat}.`;
  }
};
