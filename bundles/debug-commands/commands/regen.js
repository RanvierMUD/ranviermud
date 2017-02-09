'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : state => (args, player) => {
      const options = {
        state: { magnitude: 3 }
      };
      let regenEffect = state.EffectFactory.create(state, 'regen', options, player);
      player.addEffect(regenEffect);
    }
  };
};



