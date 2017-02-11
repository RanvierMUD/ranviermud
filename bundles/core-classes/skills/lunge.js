'use strict';

/**
 * Basic warrior attack
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const Parser = require(srcPath + 'CommandParser').CommandParser;
  const SkillType = require(srcPath + 'SkillType');

  const damagePercent = 100;
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
      cost: 20
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
      const finalAmount = damage.commit(target);
    },

    info: (player) => {
      return `Make a strong attack against your target dealing <bold>${damagePercent}%</bold> of your Strength as Physical damage.`;
    }
  };
};
