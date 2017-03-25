'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');
  const Heal = require(srcPath + 'Heal');

  // config placed here just for easy copy/paste of this skill later on
  const cooldown = 8;
  const damagePercent = 200;
  const favorAmount = 5;
  const reductionPercent = 30;

  const totalDamage = player => {
    return player.calculateWeaponDamage() * (damagePercent / 100);
  };

  return {
    name: 'Judge',
    type: SkillType.SKILL,
    requiresTarget: true,
    initiatesCombat: true,
    cooldown,

    run: state => function (args, player, target) {
      const effect = state.EffectFactory.create('skill.judge', target, {}, { reductionPercent });
      effect.skill = this;
      effect.attacker = player;

      Broadcast.sayAt(player, `<b><yellow>Concentrated holy energy slams into ${target.name}!</yellow></b>`);
      Broadcast.sayAtExcept(player.room, `<b><yellow>${player.name} conjures concentrated holy energy and slams it into ${target.name}!</yellow></b>`, [target, player]);
      Broadcast.sayAt(target, `<b><yellow>${player.name} conjures concentrated holy energy and slams it into you!</yellow></b>`);

      const favorRestore = new Heal({
        attribute: 'favor',
        amount: favorAmount,
        attacker: player,
        source: this
      });
      target.addEffect(effect);
      favorRestore.commit(player);
    },

    info: (player) => {
      return `Slam your target with holy power, dealing <b>${damagePercent}%</b> weapon damage and reducing damage of the target's next attack by <b>${reductionPercent}%</b>. Generates <b><yellow>${favorAmount}</yellow></b> Favor.`;
    }
  };
};
