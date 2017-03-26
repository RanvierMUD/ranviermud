'use strict';

module.exports = srcPath => {
  return {
    name: 'Paladin',
    description: 'Defenders of the Light. Paladins wield the favor of their god to heal the wounded, protect those in danger, and smite their enemies. They may not wield as much raw physical power as Warriors but their ability to keep themselves and others alive in the face of danger has no equal.',

    abilityTable: {
      3: { skills: ['judge'] },
    },

    setupPlayer: player => {
      // Paladins use Favor, with a max of 10. Favor is a generated resource and returns to 0 when out of combat
      player.addAttribute('favor', 10, -10);
      player.prompt = '[ <b><red>%health.current%</red></b>/<red>%health.max%</red> <b>hp</b> <b><yellow>%favor.current%</yellow></b>/<yellow>%favor.max%</yellow> <b>favor</b> ]';
    }
  };
};
