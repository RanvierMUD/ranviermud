'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      command: state => function (player, commandName, args) {
        Broadcast.sayAt(player, `You just executed room context command '${commandName}' with arguments ${args}`);
      }
    }
  };
};
