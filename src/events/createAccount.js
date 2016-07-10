exports.event = (players, items, rooms, npcs, accounts, l10n) =>
  function createAccount(socket, stage, name, account) {

    const say = EventUtil.gen_say(socket);
    stage = stage || 'check';

    l10n.setLocale('en');

    var next = EventUtil.gen_next('createAccount');
    var repeat = EventUtil.gen_repeat(arguments, next);

    switch (stage) {

      case 'check':
        let newAccount = null;
        socket.write('No such account exists.\r\n');
        say('<bold>Do you want your account\'s username to be ' + name + '?</bold> <cyan>[y/n]</cyan> ');

        socket.once('data', data => {

          if (!isNegot(data)) {
            next(socket, 'createAccount', name, null);
            return;
          }

          data = data.toString('').trim();
          if (data[0] === 0xFA) {
            return repeat();
          }

          if (data && data === 'y') {
            socket.write('Creating account...\r\n');
            newAccount = new Account();
            newAccount.setUsername(name);
            newAccount.setSocket(socket);
            return next(socket, 'password', name, newAccount);

          } else if (data && data === 'n') {
            socket.write('Goodbye!\r\n');
            return socket.end();

          } else {
            return repeat();
          }
        });
      break;

      case 'password':
        socket.write(L('PASSWORD'));
        socket.once('data', pass => {
            pass = pass.toString().trim();
            if (!pass) {
              socket.write(L('EMPTY_PASS'));
              return repeat();
            }

            // setPassword handles hashing
            account.setPassword(pass);
            accounts.addAccount(account);

            account.getSocket()
              .emit('createPlayer', account.getSocket(), 'name', account, null);
          });
        break;

    }
  };
