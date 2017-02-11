'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : state => (args, player) => {
      let shieldEffect = state.EffectFactory.create('damageshield', player, {}, { magnitude: 50 });
      player.addEffect(shieldEffect);
    }
  };
};
