'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'ошибка <описание ошибки>',
    aliases: ['typo', 'suggestion', "ошибка"],
    command: state => (args, player, arg0) => {
      if (!args) {
        return Broadcast.sayAt(player, '<b><yellow>Пожалуйста, опишите ошибку, с которой вы столкнулись.</yellow></b>');
      }

      player.emit('bugReport', {
        description: args,
        type: arg0
      });

      Broadcast.sayAt(player, '<b>Ваша ошибка была записана.</b>\n');
      Broadcast.sayAt(player, '<b>Спасибо!</b>');
    }
  };
};