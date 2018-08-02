'use strict';

module.exports = srcPath => {
  return {
    name: 'Витязь',
    description: 'Воины света.',

    abilityTable: {
      3: { skills: ['judge'] },
      5: { skills: ['plea'] },
      7: { skills: ['smite'] },
    },

    setupPlayer: player => {
      // Paladins use Favor, with a max of 10. Favor is a generated resource and returns to 0 when out of combat
      player.addAttribute('favor', 10, -10);
      player.prompt = '[ <b>Жизни: </b><b><red>%health.current%</red></b>/<red>%health.max%</red>  <b>Благословление</b>: <b><yellow>%favor.current%</yellow></b>/<yellow>%favor.max%</yellow>  ]';
    }
  };
};
