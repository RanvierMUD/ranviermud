'use strict';

const crypto = require('crypto');

/**
 * Account password event
 */
module.exports = (srcPath) => {
  const Data = require(srcPath + 'Data');
  const Account = require(srcPath + 'Account');
  const Broadcast = require(srcPath + 'Broadcast');

  let passwordAttempts = {};
  const maxFailedAttempts = 2;

  return {
    event: state => (socket, args) => {
      let name = args.account.name;

      if (!passwordAttempts[name]) {
        passwordAttempts[name] = 0;
      }

      // Boot and log any failed password attempts
      if (passwordAttempts[name] > maxFailedAttempts) {
        socket.write("Password attempts exceeded.\r\n");
        passwordAttempts[name] = 0;
        socket.end();
        return false;
      }

      if (!args.dontwelcome) {
        socket.write("Enter your password: ");
        socket.toggleEcho();
      }

      socket.once('data', pass => {
        socket.toggleEcho();

        // TODO: Replace MD5
        pass = crypto.createHash('md5').update(pass.toString('').trim()).digest('hex');

        if (pass !== args.account.password) {
          say('Incorrect password.\r\n');
          passwordAttempts[name]++;

          return socket.emit('password', socket, args);
        }

        return socket.emit('choose-character', socket, { account: args.account });
      });
    }
  };
};
