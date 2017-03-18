'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      command: state => function (player, commandName) {
        Broadcast.sayAt(player, `You just executed room context command '${commandName}'`);
      }
    }
  };
};
