'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      get: state => function (player) {
        Broadcast.sayAt(player, `You nearly stab yourself with the pointy end as you pick up ${this.name}`);
      }
    }
  };
};
