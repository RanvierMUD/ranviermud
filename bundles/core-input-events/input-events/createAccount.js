'use strict';

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Account = require(srcPath + 'Account');

  return {
    event: (state) => (socket, stage, name, account) => {
      const say = EventUtil.genSay(socket);
      const write = EventUtil.genWrite(socket);
      stage = stage || 'check';

      const next   = EventUtil.genNext('createAccount');
      const repeat = EventUtil.genRepeat(arguments, next);

      switch (stage) {
        case 'check': {
          let newAccount = null;
          write(`<bold>Do you want your account's username to be ${name}?</bold> <cyan>[y/n]</cyan> `);

          socket.once('data', data => {
            data = data.toString('').trim();

            data = data.toLowerCase();
            if (data === 'y' || data === 'yes') {
              say('Creating account...');
              newAccount = new Account({
                username: name
              });

              return next(socket, 'password', name, newAccount);
            } else if (data && data === 'n' || data === 'no') {
              say("Let's try again!");

              return socket.emit('login', socket, 'login');
            }

            return repeat();
          });
        }
        break;

        //TODO: Validate password creation.
        case 'password': {
          say('Your password must be between 6 and 30 characters.');
          write('<cyan>Enter your account password:</cyan> ');
          socket.toggleEcho();
          socket.once('data', pass => {
            socket.toggleEcho();
            say('');
            pass = pass.toString().trim();

            if (!pass) {
              say('You must use a password.');
              return repeat();
            }
            if (pass.length <= 5) {
              say('Your password is not long enough.');
              return repeat();
            }
            if (pass.length > 30) {
              say('Your password is too long.');
              return repeat();
            }

            // setPassword handles hashing
            account.setPassword(pass);
            state.AccountManager.addAccount(account);
            account.save();

            socket.emit('createPlayer', socket, 'name', { account });
          });
          break;
        }
      }
    }
  };
};
