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
    return player.getAttribute('intelligence') * (healPercent / 100);
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

      Broadcast.sayAt(player, "<bold>You call upon to the light to heal your target's wounds.</bold>");
      heal.commit(target);
    },

    info: (player) => {
      return `Call upon the light to heal your target's wounds for ${healPercent}% of your Intelligence.`;
    }
  };
};
