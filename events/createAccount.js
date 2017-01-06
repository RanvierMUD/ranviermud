'use strict';
const src       = '../src/';
const Account   = require(src + 'accounts').Account;
const EventUtil = require('./event_util').EventUtil;

exports.event = (players, items, rooms, npcs, accounts, l10n) =>
  /**
   * Create an account
   * Stages:
   *
   *   done:   This is always the end step, here we register them in with
   *           the rest of the logged in players and where they log in
   *
   * @param {String} string stage See above
   * @param {String}  name    account username
   * @param {Account} player account obj
   */
  function createAccount(socket, stage, name, account) {

    const say = EventUtil.gen_say(socket);
    stage = stage || 'check';

    l10n.setLocale('en');

    const next   = EventUtil.gen_next('createAccount');
    const repeat = EventUtil.gen_repeat(arguments, next);

    switch (stage) {
      case 'check': {
        let newAccount = null;
        say(`<bold>Do you want your account's username to be ${name}?</bold> <cyan>[y/n]</cyan> `);

        socket.once('data', data => {
          data = data.toString('').trim();

          data = data.toLowerCase();
          if (data === 'y' || data === 'yes') {
            say('Creating account...');
            newAccount = new Account();
            newAccount.setUsername(name);
            newAccount.setSocket(socket);

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
        say('Your password must be between 6 and 30 characters.\n<cyan>Enter your account password:</cyan> ');
        socket.toggleEcho();
        socket.once('data', pass => {
            socket.toggleEcho();
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
            accounts.addAccount(account);

            account.getSocket().emit('createPlayer', account.getSocket(), 'name', account, null);
          });
        break;
      }
    }
  };
