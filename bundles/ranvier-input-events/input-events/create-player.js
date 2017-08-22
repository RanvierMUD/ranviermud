'use strict';

/**
 * Player creation event
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');

  return {
    event : (state) => (socket, args) => {
      const say    = EventUtil.genSay(socket);
      const write  = EventUtil.genWrite(socket);

      write("<bold>What would you like to name your character?</bold> ");
      socket.once('data', name => {
        say('');
        name = name.toString().trim();

        const invalid = Player.validateName(name);

        if (invalid) {
          say(invalid);
          return socket.emit('create-player', socket, args);
        }

        name = name[0].toUpperCase() + name.slice(1);

        const exists = state.PlayerManager.exists(name);

        if (exists) {
          say(`That name is already taken.`);
          return socket.emit('create-player', socket, args);
        }

        args.name = name;
        return socket.emit('player-name-check', socket, args);
      });
    }
  };
};
