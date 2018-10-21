'use strict';

module.exports = () => {
  const Ranvier = require('ranvier');
  const Broadcast = Ranvier.Broadcast;

  return  {
    listeners: {
      command: state => function (player, commandName, args) {
        Broadcast.sayAt(player, `You just executed room context command '${commandName}' with arguments ${args}`);
      }
    }
  };
};
