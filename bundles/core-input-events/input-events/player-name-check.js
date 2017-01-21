'use strict';

/**
 * Confirm new player name
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  return {
    event: state => (socket, args) => {
      const say = EventUtil.genSay(socket);
      const write  = EventUtil.genWrite(socket);

      write(`<bold>${args.name} doesn't exist, would you like to create it?</bold> <cyan>[y/n]</cyan> `);
      socket.once('data', confirmation => {
        say('');
        confirmation = confirmation.toString().trim().toLowerCase();

        if (!/[yn]/.test(confirmation)) {
          return socket.emit('player-name-check', socket, args);
        }

        if (confirmation === 'n') {
          say(`Let's try again...`);
          return socket.emit('create-player', socket, args);
        }

        return socket.emit('finish-player', socket, args);
      });
    }
  };
};
