'use strict';

const util   = require('util');

const Account   = require('../accounts').Account;
const EventUtil = require('./event_util').EventUtil;

exports.event = (players, items, rooms, npcs, accounts, l10n) =>
  function createAccount(socket, stage, name, account) {

    const say = EventUtil.gen_say(socket);
    stage = stage || 'check';

    l10n.setLocale('en');

    const next   = EventUtil.gen_next('createAccount');
    const repeat = EventUtil.gen_repeat(arguments, next);

    switch (stage) {

      case 'check':
        let newAccount = null;
        socket.write('No such account exists.\r\n');
        say('<bold>Do you want your account\'s username to be ' + name + '?</bold> <cyan>[y/n]</cyan> ');

        socket.once('data', data => {

          if (!EventUtil.isNegot(data)) {
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

      //TODO: Validate password creation.
      case 'password':
        socket.write('Enter your account password: ');
        socket.once('data', pass => {
            pass = pass.toString().trim();
            if (!pass) {
              socket.write('You must use a password.\r\n');
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
