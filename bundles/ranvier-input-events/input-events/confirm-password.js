'use strict';

const { EventUtil } = require('ranvier');

/**
 * Account password confirmation station
 */
module.exports = {
  event: state => (socket, args) => {
    const write = EventUtil.genWrite(socket);
    const say = EventUtil.genSay(socket);

    if (!args.dontwelcome) {
      write("<cyan>Confirm your password:</cyan> ");
      socket.command('toggleEcho');
    }

    socket.once('data', pass => {
      socket.command('toggleEcho');

      if (!args.account.checkPassword(pass.toString().trim())) {
        say("<red>Passwords do not match.</red>");
        return socket.emit('change-password', socket, args);
      }

      say(''); // echo was disabled, the user's Enter didn't make a newline
      return socket.emit(args.nextStage, socket, args);
    });
  }
};
