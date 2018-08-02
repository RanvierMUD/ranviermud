'use strict';

/**
 * Confirm new player name
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  return {
    event: state => (socket, args) => {
      const say = EventUtil.genSay(socket);
      const write  = EventUtil.genWrite(socket);

      write(`<bold>${args.name} не найден, вы хотите создать?</bold> <cyan>[да/нет]</cyan> `);
      socket.once('data', confirmation => {
        say('');
        confirmation = confirmation.toString().trim().toLowerCase();
        
		Logger.log(confirmation);
        if (confirmation != 'да')  {
          say(`Давай попробуем снова...`);
          return socket.emit('create-player', socket, args);
        }
        socket.emit('choose-sex', socket, args);
      });
    }
  };
};
