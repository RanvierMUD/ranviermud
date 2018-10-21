'use strict';

const { PlayerRoles } = require('ranvier');

module.exports = {
  requiredRole: PlayerRoles.ADMIN,
  command: state => (args, player) => {
    let regenEffect = state.EffectFactory.create('buff', player, { duration: 60 * 1000 }, { magnitude: 5 });
    player.addEffect(regenEffect);
  }
};
