'use strict';

const Combat = require('../../ranvier-combat/lib/Combat');

/**
 * Basic warrior attack
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');

  const damagePercent = 250;
  const energyCost = 20;

  function getDamage(player) {
    return Combat.calculateWeaponDamage(player) * (damagePercent / 100);
  }

  return {
    name: 'Lunge',
    type: SkillType.SKILL,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'energy',
      cost: energyCost,
    },
    cooldown: 6,

    run: state => function (args, player, target) {
      const damage = new Damage({
        attribute: 'health',
        amount: getDamage(player),
        attacker: player,
        type: 'physical',
        source: this
      });

      Broadcast.sayAt(player, '<red>You shift your feet and let loose a mighty attack!</red>');
      Broadcast.sayAtExcept(player.room, `<red>${player.name} lets loose a lunging attack on ${target.name}!</red>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<red>${player.name} lunges at you with a fierce attack!</red>`);
      }
      damage.commit(target);
    },

    info: (player) => {
      return `Make a strong attack against your target dealing <bold>${damagePercent}%</bold> weapon damage.`;
    }
  };
};
