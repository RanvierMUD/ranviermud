'use strict';

const sprintf = require('sprintf-js').sprintf;
const { Broadcast } = require('ranvier');

/**
 * View command queue
 */
module.exports = {
  aliases: [ 'pending' ],
  usage: 'queue',
  command : (state) => (args, player) => {
    Broadcast.sayAt(player, '<bold><yellow>Command Queue:</yellow></bold>');
    if (!player.commandQueue.hasPending) {
      return Broadcast.sayAt(player, ' -) None.');
    }

    const commands = player.commandQueue.queue;
    const indexToken =  '%' + ((commands.length + 1) + '').length + 's';
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const index = sprintf(indexToken, i + 1);
      const ttr = sprintf('%.1f', player.commandQueue.getTimeTilRun(i));
      let buf = ` ${index}) <bold><white>${command.label}</white></bold>`;
      buf += ` <yellow>(</yellow><bold><white>${ttr}s</white></bold><yellow>)</yellow>`;
      Broadcast.sayAt(player, buf);
    }

    Broadcast.sayAt(player, '<bold><yellow>Use the "flush" command to flush the queue</yellow></bold>');
  }
};
