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

      write(`<bold>${args.name} не найден, вы хотите создать?</bold> <cyan>[да/нет]</cyan> `);
      socket.once('data', confirmation => {
        say('');
        confirmation = confirmation.toString().trim().toLowerCase();
        

        if (confirmation != 'да')  {
          say(`Давай попробуем снова...`);
          return socket.emit('create-player', socket, args);
        }
        socket.emit('choose-sex', socket, args);
      });
    }
  };
};
