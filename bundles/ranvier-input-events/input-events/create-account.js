'use strict';

const { Account, EventUtil } = require('ranvier');

/**
 * Account creation event
 */
module.exports = {
  event: (state) => (socket, name) => {
    const write = EventUtil.genWrite(socket);
    const say = EventUtil.genSay(socket);

    let newAccount = null;
    write(`<bold>Do you want your account's username to be ${name}?</bold> <cyan>[y/n]</cyan> `);

    socket.once('data', data => {
      data = data.toString('utf8').trim();

      data = data.toLowerCase();
      if (data === 'y' || data === 'yes') {
        say('Creating account...');
        newAccount = new Account({
          username: name
        });

        return socket.emit('change-password', socket, {
          account: newAccount,
          nextStage: 'create-player'
        });
      } else if (data && data === 'n' || data === 'no') {
        say("Let's try again!");

        return socket.emit('login', socket);
      }

      return socket.emit('create-account', socket, name);
    });
  }
};
