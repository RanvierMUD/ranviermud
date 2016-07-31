'use strict';

/**
 * Create an account
 * Stages:
 *
 *   done:   This is always the end step, here we register them in with
 *           the rest of the logged in players and where they log in
 *
 * @param object arg This is either a Socket or a Player depending on
 *                  the stage.
 * @param string stage See above
 * @param name  account username
 * @param account player account obj
 */

const util   = require('util');

const src       = '../src/';
const Account   = require(src + 'accounts').Account;
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

          const firstLetter = data.split('')[0].toLowerCase();
          if (data && firstLetter === 'y') {
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
            if (pass.length <= 5) {
              socket.write('Your password must be 6 characters or longer.\r\n');
              return repeat();
            }
            if (pass.length > 30) {
              socket.write('Your password must be less than or equal to 30 characters.\r\n');
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
