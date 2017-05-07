'use strict';

/**
 * Basic cleric spell
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');

  const healPercent = 20;
  const favorCost = 5;
  const bonusThreshold = 30;
  const cooldown = 20;

  return {
    name: 'Plea of Light',
    initiatesCombat: false,
    requiresTarget: true,
    targetSelf: true,
    resource: {
      attribute: 'favor',
      cost: favorCost,
    },
    cooldown,

    run: state => function (args, player, target) {
      const maxHealth = target.getMaxAttribute('health');
      let amount = Math.round(maxHealth * (healPercent / 100));
      if (target.getAttribute('health') < (maxHealth *  (bonusThreshold / 100))) {
        amount *= 2;
      }

      const heal = new Heal({
        attribute: 'health',
        amount,
        attacker: target === player ? null : player,
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
      return `Call upon the light to heal <b>${healPercent}%</b> of your or your target's max health. If below ${bonusThreshold}% health, Plea of Light heals twice as much.`;
    }
  };
};
