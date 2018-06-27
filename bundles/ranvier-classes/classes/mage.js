'use strict';

/**
 * See warrior.js for more on classes.
 */
module.exports = srcPath => {
  return {
    name: 'Маг',
    description: 'Маги обучаются много лет, чтобы мастерски использовать тайные силы магии.',
    abilityTable: {
      5: { spells: ['fireball'] },
    },

    setupPlayer: player => {
      player.addAttribute('mana', 100);
      player.prompt = '[ %health.current%/%health.max% <b>hp</b> %mana.current%/%mana.max% <b>мана</b> ]';
    }
  };
};
