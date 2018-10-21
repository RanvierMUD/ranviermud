'use strict';

const { EventUtil } = require('ranvier');

let passwordAttempts = {};
const maxFailedAttempts = 2;


/**
 * Account password event
 */
module.exports = {
  event: state => (socket, args) => {
    const write = EventUtil.genWrite(socket);

    let name = args.account.name;

    if (!passwordAttempts[name]) {
      passwordAttempts[name] = 0;
    }

    // Boot and log any failed password attempts
    if (passwordAttempts[name] > maxFailedAttempts) {
      write("Password attempts exceeded.\r\n");
      passwordAttempts[name] = 0;
      socket.end();
      return false;
    }

    if (!args.dontwelcome) {
      write("Enter your password: ");
      socket.command('toggleEcho');
    }

    socket.once('data', pass => {
      socket.command('toggleEcho');

      if (!args.account.checkPassword(pass.toString().trim())) {
        write("<red>Incorrect password.</red>\r\n");
        passwordAttempts[name]++;

        return socket.emit('password', socket, args);
      }

      return socket.emit('choose-character', socket, { account: args.account });
    });
  }
};
