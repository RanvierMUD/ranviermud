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
      player.prompt = '[ <b>Жизни:</b> %health.current%/%health.max%  <b>Мана:</b> %mana.current%/%mana.max%  ]';
    }
  };
};
