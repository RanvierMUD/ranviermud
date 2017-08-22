'use strict';

/**
 * Basic cleric spell
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const SkillType = require(srcPath + 'SkillType');

  const healPercent = 300;
  const energyCost = 40;

  function getHeal(player) {
    return player.getAttribute('intellect') * (healPercent / 100);
  }

  return {
    name: 'Heal',
    type: SkillType.SPELL,
    requiresTarget: true,
    initiatesCombat: false,
    targetSelf: true,
    resource: {
      attribute: 'energy',
      cost: energyCost,
    },
    cooldown: 10,

    run: state => function (args, player, target) {
      const heal = new Heal({
        attribute: 'health',
        amount: getHeal(player),
        attacker: player,
        source: this
      });

      if (target !== player) {
        Broadcast.sayAt(player, `<b>You call upon to the light to heal ${target.name}'s wounds.</b>`);
        Broadcast.sayAtExcept(player.room, `<b>${player.name} calls upon to the light to heal ${target.name}'s wounds.</b>`, [target, player]);
        Broadcast.sayAt(target, `<b>${player.name} calls upon to the light to heal your wounds.</b>`);
      } else {
        Broadcast.sayAt(player, "<b>You call upon to the light to heal your wounds.</b>");
        Broadcast.sayAtExcept(player.room, `<b>${player.name} calls upon to the light to heal their wounds.</b>`, [player, target]);
      }

      heal.commit(target);
    },

    info: (player) => {
      return `Call upon the light to heal your target's wounds for ${healPercent}% of your Intellect.`;
    }
  };
};
