'use strict';

/**
 * Configureable critical hit behavior.
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');
  const Damage = require(srcPath + 'Damage');
  return  {
    listeners: {
      equip: state => function (config = {}, wielder) {
        const stateConfig = Object.assign({}, config, { slot: this.slot });
        const critEffect = state.EffectFactory.create('crit', wielder, {}, stateConfig);
        wielder.addEffect(critEffect);
      }
    }
  };
};
