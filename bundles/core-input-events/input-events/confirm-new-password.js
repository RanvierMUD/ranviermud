'use strict';

/**
 * Account password confirmation station
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');

  return {
    event: state => (socket, args) => {
      const write = EventUtil.genWrite(socket);

      if (!args.dontwelcome) {
        write("<cyan>Confirm your password:</cyan> ");
        socket.toggleEcho();
      }

      socket.once('data', pass => {
        socket.toggleEcho();

        if (!args.account.checkPassword(pass.toString().trim())) {
          write("<red>Passwords do not match.</red>\r\n");
          return socket.emit('new-account-password', socket, args);
        }

        return socket.emit('create-player', socket, { account: args.account });
      });
    }
  };
};
