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

      say("Пароль должен быть не меньше 8 символов.");
      write('<cyan>Введите ваш пароль от аккаунта:</cyan> ');

      socket.command('toggleEcho');
      socket.once('data', pass => {
        socket.command('toggleEcho');
        say('');

        pass = pass.toString().trim();

        if (!pass) {
          say('У вас должен быть пароль.');
          return socket.emit('change-password', socket, args);
        }

        if (pass.length < 8) {
          say('Ваш пароль меньше 8 символов.');
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
};
