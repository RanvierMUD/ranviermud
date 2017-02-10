'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : state => (args, player) => {
      let regenEffect = state.EffectFactory.create('regen', player, {}, { magnitude: 3 });
      player.addEffect(regenEffect);
      regenEffect.activate();
    }
  };
};



