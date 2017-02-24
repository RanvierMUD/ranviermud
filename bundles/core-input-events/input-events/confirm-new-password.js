'use strict';

/**
 * Account password confirmation station
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');

  return {
    event: state => (socket, args) => {
      const write = EventUtil.genWrite(socket);
      const say = EventUtil.genSay(socket);

      if (!args.dontwelcome) {
        write("<cyan>Confirm your password:</cyan> ");
        socket.toggleEcho();
      }

      socket.once('data', pass => {
        socket.toggleEcho();

        if (!args.account.checkPassword(pass.toString().trim())) {
          say("<red>Passwords do not match.</red>");
          return socket.emit('new-account-password', socket, args);
        }

        say(''); // echo was disabled, the user's Enter didn't make a newline
        return socket.emit('create-player', socket, { account: args.account });
      });
    }
  };
};
