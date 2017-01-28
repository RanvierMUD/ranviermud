'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const util = require('util');

  return  {
    listeners: {
      playerEnter: state => function (player) {
        Broadcast.sayAt(player, 'The floorboards creak as you enter the room.');
      }
    }
  };
}
