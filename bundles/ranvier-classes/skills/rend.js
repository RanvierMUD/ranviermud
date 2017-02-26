'use strict';

/**
 * DoT (Damage over time) skill
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');

  // config placed here just for easy copy/paste of this skill later on
  const attribute = 'strength';
  const cooldown = 20;
  const cost = 50;
  const duration = 15 * 1000;
  const tickInterval = 3;

  const totalDamage = player => {
    return player.getAttribute(attribute) * 4;
  };

  return {
    name: 'Rend',
    type: SkillType.SKILL,
    requiresTarget: true,
    resource: {
      attribute: 'energy',
      cost,
    },
    cooldown,

    run: state => function (args, player, target) {
      if (!player.isInCombat(target)) {
        return Broadcast.sayAt(player, "You're not fighting them at the moment.");
      }

      const effect = state.EffectFactory.create(
        'skill.rend',
        target,
        {
          duration,
          description: this.info(player),
          tickInterval,
        },
        {
          totalDamage: totalDamage(player),
        }
      );
      effect.skill = this;
      effect.attacker = player;

      Broadcast.sayAt(player, `<red>With a vicious attack you open a deep wound in <bold>${target.name}</bold>!</red>`);
      target.addEffect(effect);
    },

    info: (player) => {
      return `Tear a deep wound in your target's flesh dealing <bold>${totalDamage(player)}</bold> physical damage over <bold>${duration / 1000}</bold> seconds.`;
    }
  };
};
