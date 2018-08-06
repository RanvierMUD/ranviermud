'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'bug <description>',
    aliases: ['typo', 'suggestion'],
    command: state => (args, player, arg0) => {
      if (!args) {
        return Broadcast.sayAt(player, '<b><yellow>Пожалуйста, опишите ошибку, с которой вы столкнулись.</yellow></b>');
      }

      player.emit('bugReport', {
        description: args,
        type: arg0
      });

      Broadcast.sayAt(player, `<b>Ваша ${arg0} жалоба была принята как:</b>\n${args}`);
      Broadcast.sayAt(player, '<b>Спасибо!</b>');
    }
  };
};