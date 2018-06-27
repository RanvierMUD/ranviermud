'use strict';

/**
 * Account creation event
 */
module.exports = (srcPath) => {
  const Account = require(srcPath + 'Account');
  const EventUtil = require(srcPath + 'EventUtil');

  return {
    event: (state) => (socket, name) => {
      const write = EventUtil.genWrite(socket);
      const say = EventUtil.genSay(socket);

      let newAccount = null;
      write(`<bold>Вы хотите создать новый аккаунт с именем "${name}"?</bold> <cyan>[да/нет]</cyan> `);

      socket.once('data', data => {
        data = data.toString('utf8').trim();

        data = data.toLowerCase();
        if (data === 'y' || data === 'yes' || data === 'да' || data === 'д') {
          say('Ладушки, создаем аккаунт...');
          newAccount = new Account({
            username: name
          });

          return socket.emit('change-password', socket, {
            account: newAccount,
            nextStage: 'create-player'
          });
        } else if (data && data === 'n' || data === 'no' || data === 'нет' || data === 'н') {
          say("Попробуйте снова!");

          return socket.emit('login', socket);
        }

        return socket.emit('create-account', socket, name);
      });
    }
  };
};
