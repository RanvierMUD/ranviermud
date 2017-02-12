'use strict';

module.exports = (srcPath) => {
  return {
    command : state => (args, player) => {
      let shieldEffect = state.EffectFactory.create('damageshield', player, {}, { magnitude: 50 });
      player.addEffect(shieldEffect);
    }
  };
};
