'use strict';

module.exports = (srcPath) => {
  return {
    command : state => (args, player) => {
      let regenEffect = state.EffectFactory.create('regen', player, {}, { magnitude: 3 });
      player.addEffect(regenEffect);
    }
  };
};
