'use strict';

const { Broadcast, SkillType } = require('ranvier');

// config placed here just for easy configuration of this skill later on
const attribute = 'strength';
const cooldown = 45;
const cost = 50;
const healthPercent = 15;
const duration = 20 * 1000;

/**
 * Damage mitigation skill
 */
module.exports = {
  name: 'Shield Block',
  type: SkillType.SKILL,
  requiresTarget: false,
  resource: {
    attribute: 'energy',
    cost,
  },
  cooldown,

  run: state => function (args, player, target) {
    if (!player.equipment.has('shield')) {
      Broadcast.sayAt(player, "You aren't wearing a shield!");
      return false;
    }

    const effect = state.EffectFactory.create(
      'skill.shieldblock',
      player,
      {
        duration,
        description: this.info(player),
      },
      {
        magnitude: Math.round(player.getMaxAttribute('health') * (healthPercent / 100))
      }
    );
    effect.skill = this;

    Broadcast.sayAt(player, `<b>You raise your shield, bracing for incoming attacks!</b>`);
    Broadcast.sayAtExcept(player.room, `<b>${player.name} raises their shield, bracing for incoming damage.</b>`, [player]);
    player.addEffect(effect);
  },

  info: (player) => {
    return `Raise your shield block damage up to <bold>${healthPercent}%</bold> of your maximum health for <bold>${duration / 1000}</bold> seconds. Requires a shield.`;
  }
};
