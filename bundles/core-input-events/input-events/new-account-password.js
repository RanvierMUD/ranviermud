'use strict';

/**
 * MOTD event
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');

  return {
    event: state => (socket, args) => {
      const say = EventUtil.genSay(socket);
      const write = EventUtil.genWrite(socket);

      say("Your password must be between 6 and 30 characters.");
      write('<cyan>Enter your account password:</cyan> ');

      socket.toggleEcho();
      socket.once('data', pass => {
        socket.toggleEcho();
        say('');
        pass = pass.toString().trim();

        if (!pass) {
          say('You must use a password.');
          return socket.emit('new-account-password', socket, args);
        }
        if (pass.length <= 5) {
          say('Your password is not long enough.');
          return socket.emit('new-account-password', socket, args);
        }
        if (pass.length > 30) {
          say('Your password is too long.');
          return socket.emit('new-account-password', socket, args);
        }

        // setPassword handles hashing
        args.account.setPassword(pass);
        state.AccountManager.addAccount(args.account);
        args.account.save();

        socket.emit('create-player', socket, args);
      });
    }
  };
};
