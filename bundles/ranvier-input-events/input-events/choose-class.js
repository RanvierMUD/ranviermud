'use strict';

/**
 * Player class selection event
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config     = require(srcPath + 'Config');

  return {
    event: state => (socket, args) => {
      const player = args.player;
      const say = str => Broadcast.sayAt(player, str);
      const at = str => Broadcast.at(player, str);

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
        say(`  [<bold>${id}</bold>] - <bold>${config.name}</bold>`);
        Broadcast.sayAt(player, `      ${config.description}\r\n`, 80);
      }
      at('> ');

      socket.once('data', choice => {
        choice = choice.toString().trim();
        choice = classes.find(([id, config]) => {
          return id.includes(choice) || config.name.toLowerCase().includes(choice);
        });

        if (!choice) {
          return socket.emit('choose-class', socket, args);
        }

        player.setMeta('class', choice[0]);
        socket.emit('done', socket, { player });
      });
    }
  };
};
