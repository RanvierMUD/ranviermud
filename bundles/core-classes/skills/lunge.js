'use strict';

/**
 * Basic warrior attack
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');

  const damagePercent = 500;
  const energyCost = 20;

  function getDamage(player) {
    return player.getAttribute('strength') * (damagePercent / 100);
  }

  return {
    name: 'Lunge',
    type: SkillType.SKILL,
    requiresTarget: true,
    resource: {
      attribute: 'energy',
      cost: energyCost,
    },
    cooldown: 5,

    run: state => function (args, player, target) {
      if (!player.isInCombat(target)) {
        return Broadcast.sayAt(player, "You're not fighting them at the moment.");
      }

      const damage = new Damage({
        attribute: 'health',
        amount: getDamage(player),
        attacker: player,
        type: 'physical',
        source: this
      });

      Broadcast.sayAt(player, '<red>You shift your feet and let loose a mighty attack!</red>');
      damage.commit(target);
    },

    info: (player) => {
      return `Make a strong attack against your target dealing <bold>${damagePercent}%</bold> of your Strength as Physical damage.`;
    }
  };
};
