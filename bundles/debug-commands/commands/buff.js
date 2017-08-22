'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const PlayerRoles = require(srcPath + 'PlayerRoles');

  return {
    requiredRole: PlayerRoles.ADMIN,
    command: state => (args, player) => {
      let regenEffect = state.EffectFactory.create('buff', player, { duration: 60 * 1000 }, { magnitude: 5 });
      player.addEffect(regenEffect);
    }
  };
};
