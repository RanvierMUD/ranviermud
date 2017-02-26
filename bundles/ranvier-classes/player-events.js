'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      useAbility: state => function (ability, args) {
        if (!this.playerClass.hasAbility(ability.id)) {
          return Broadcast.sayAt(this, 'Your class cannot use that ability.');
        }

        if (!this.playerClass.canUseAbility(this, ability.id)) {
          return Broadcast.sayAt(this, 'You have not yet learned that ability.');
        }

        ability.execute(args, this);
      },

      /**
       * Handle player leveling up
       */
      level: state => function () {
        const abilities = this.playerClass.abilityTable;
        if (!(this.level in this.playerClass.abilityTable)) {
          return;
        }

        const newSkills = abilities[this.level].skills || [];
        for (const abilityId of newSkills) {
          const skill = state.SkillManager.get(abilityId);
          Broadcast.sayAt(this, `<bold><yellow>You can now use skill: ${skill.name}.</yellow></bold>`);
          skill.activate(this);
        }

        const newSpells = abilities[this.level].spells || [];
        for (const abilityId of newSpells) {
          const spell = state.SpellManager.get(abilityId);
          Broadcast.sayAt(this, `<bold><yellow>You can now use spell: ${spell.name}.</yellow></bold>`);
        }
      }
    }
  };
};
