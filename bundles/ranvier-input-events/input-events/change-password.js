'use strict';

const { EventUtil } = require('ranvier');

/**
 * Change password event
 */
module.exports = {
  event: state => (socket, args) => {
    const say = EventUtil.genSay(socket);
    const write = EventUtil.genWrite(socket);

    say("Your password must be at least 8 characters.");
    write('<cyan>Enter your account password:</cyan> ');

    socket.command('toggleEcho');
    socket.once('data', pass => {
      socket.command('toggleEcho');
      say('');

      pass = pass.toString().trim();

      if (!pass) {
        say('You must use a password.');
        return socket.emit('change-password', socket, args);
      }

      if (pass.length < 8) {
        say('Your password is not long enough.');
        return socket.emit('change-password', socket, args);
      }

      // setPassword handles hashing
      args.account.setPassword(pass);
      state.AccountManager.addAccount(args.account);
      args.account.save();

      socket.emit('confirm-password', socket, args);
    });
  }
};
