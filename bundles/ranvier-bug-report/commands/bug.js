'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'bug <description>',
    aliases: ['typo', 'suggestion'],
    command: state => (args, player, arg0) => {
      if (!args) {
        return Broadcast.sayAt(player, '<b><yellow>Please describe the bug you have found.</yellow></b>');
      }

      // TODO: There's absolutely no reason for this to be an event, just move the event code into the command
      player.emit('bugReport', {
        description: args,
        type: arg0
      });

      Broadcast.sayAt(player, `<b>Your ${arg0} report has been submitted as:</b>\n${args}`);
      Broadcast.sayAt(player, '<b>Thanks!</b>');
    }
  };
};
