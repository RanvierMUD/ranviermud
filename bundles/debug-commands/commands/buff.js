'use strict';
const util  = require('util');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : state => (args, player) => {
      const options = {
        state: { magnitude: 5 }
      };
      let regenEffect = state.EffectFactory.create(state, 'buff', {}, player);
      player.addEffect(regenEffect);
    }
  };
};
