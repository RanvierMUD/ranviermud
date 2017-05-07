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


      }
    }
  };
};
