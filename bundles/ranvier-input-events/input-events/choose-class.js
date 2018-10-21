'use strict';

const { Broadcast, Config, EventUtil } = require('ranvier');

/**
 * Player class selection event
 */
module.exports = {
  event: state => (socket, args) => {
    const say = EventUtil.genSay(socket);
    const write  = EventUtil.genWrite(socket);

    /*
    Player selection menu:
    * Can select existing player
    * Can create new (if less than 3 living chars)
    */
    say('  Pick your class');
    say(' --------------------------');
    const classes = [...state.ClassManager].map(([id, instance]) => {
      return [id, instance.config];
    });
    for (const [ id, config ] of classes) {
      say(`[<bold>${id}</bold>] - <bold>${config.name}</bold>`);
      say(Broadcast.wrap(`      ${config.description}\r\n`, 80));
    }
    write('> ');

    socket.once('data', choice => {
      choice = choice.toString().trim();
      choice = classes.find(([id, config]) => {
        return id.includes(choice) || config.name.toLowerCase().includes(choice);
      });

      if (!choice) {
        return socket.emit('choose-class', socket, args);
      }

      args.playerClass = choice[0];
      socket.emit('finish-player', socket, args);
    });
  }
};
