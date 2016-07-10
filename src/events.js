'use strict';

//FIXME: Find a way to modularize as much of this as possible.

const util   = require('util'),
  ansi       = require('colorize').ansify,
  sty        = require('sty'),

  Commands   = require('./commands').Commands,
  Channels   = require('./channels').Channels,
  Data       = require('./data').Data,
  Item       = require('./items').Item,
  Player     = require('./player').Player,
  Skills     = require('./skills').Skills,
  Accounts   = require('./accounts').Accounts,
  Account    = require('./accounts').Account,
  EventUtil  = require('./events/event_util').EventUtil,

  //TODO: Deprecate this if possible.
  l10nHelper = require('./l10n');

// Event modules
//TODO: Automate this using fs.
const login = require('./events/login').event;

/**
 * Localization
 */
let l10n = null;
const l10nFile = __dirname + '/../l10n/events.yml';
// shortcut for l10n.translate
let L = null;

//TODO: Pass most of these and l10n into events.
// Some get instantiated in events.
let players  = null;
let player   = null;
let npcs     = null;
let rooms    = null;
let items    = null;
let account  = null;
let accounts = null;

/**
 * Events object is a container for any "context switches" for the player.
 * Essentially anything that requires player input will have its own listener
 * if it isn't just a basic command. Complex listeners are staged.
 * See login or createPlayer for examples
 */
const Events = {
  /**
   * Container for events
   * @var object
   */
  events: {
    /**
     * Point of entry for the player. They aren't actually a player yet
     */
    login: login,

    /**
     * Command loop
     * @param Player player
     */
    commands: function(){},

    /**
     * Create an account
     * Note: Do we already ask for a name in the login step?
     * Stages:
     *
     *   done:   This is always the end step, here we register them in with
     *           the rest of the logged in players and where they log in
     *
     * @param object arg This is either a Socket or a Player depending on
     *                  the stage.
     * @param string stage See above
     */

    createAccount: function(socket, stage, name, account) {

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
    },

    /**
     * Create a player
     * Stages:
     *   check:  See if they actually want to create a player or not
     *   name:   ... get their name
     *   done:   This is always the end step, here we register them in with
     *           the rest of the logged in players and where they log in
     *
     * @param object arg This is either a Socket or a Player depending on
     *                  the stage.
     * @param string stage See above
     */
    createPlayer: function (socket, stage, account, name) {
      stage = stage || 'name';

      const say = EventUtil.gen_say(socket);
      l10n.setLocale("en");

      var next   = EventUtil.gen_next('createPlayer');
      var repeat = EventUtil.gen_repeat(arguments, next);

      /* Multi-stage character creation i.e., races, classes, etc.
       * Always emit 'done' in your last stage to keep it clean
       * Also try to put the cases in order that they happen during creation
       */

      switch (stage) {
        case 'name':
          say("<bold>What would you like to name your character?</bold> ");
          socket.once('data', name => {

            if (!isNegot(name)) {
              return repeat();
            }

            name = capitalize(name
              .toString()
              .trim());

            const invalid = validate(name);

            //TODO: Put any player name whitelisting/blacklisting here.
            function validate(name) {
              if (name.length > 20) {
                return 'Too long, try a shorter name.';
              }
              if (name.length < 3) {
                return 'Too short, try a longer name.';
              }
              return false;
            }

            if (invalid) {
              socket.write(invalid + '\r\n');
              return repeat();
            } else {

              const exists = players.getByName(name) || Data.loadPlayer(name);

              if (exists) {
                socket.write('That name is already taken.\r\n');
                return repeat();
              } else {
                return next(socket, 'check', account, name);
              }
            }
          });
        break;

        case 'check':
          say("<bold>" + name + " doesn't exist, would you like to create it?</bold> <cyan>[y/n]</cyan> ");
          socket.once('data', check => {
            check = check.toString()
              .trim()
              .toLowerCase();

            if (!/[yn]/.test(check)) {
              return repeat();
            }

            if (check === 'n') {
              socket.write("Let's try again...\r\n");
              return socket.emit('createPlayer', socket, 'name');
            }

            return next(socket, 'create', account, name);
          });
          break;

        case 'create':
          socket.write('Creating character...');
          socket = new Player(socket);

          socket.setName(name);
          socket.setAccountName(account.getUsername());

          //FIXME: Kludgey.
          // Save player, then load in order to init.
          socket.save();
          socket.load(Data.loadPlayer(name));

          account.addCharacter(name);
          account.save();

          next(socket, 'gender');
          break;

        case 'gender':
          const validGenders = ['m', 'f', 'a'];

          say('<bold>What is your character\'s gender?</bold>\n'
          + '<cyan>[F]emale\n[M]ale\n[A]ndrogynous</cyan>\n');

          socket.getSocket()
            .once('data', gender => {
              gender = gender
                .toString()
                .trim()
                .toLowerCase();

              if (!gender || validGenders.indexOf(gender) === -1) {
                socket.say('Please specify a gender, or [A]ndrogynous if you\'d prefer.');
                return repeat();
              }

              socket.setGender(gender);
              next(socket, 'done');
            });
          break;

          // 'done' assumes the argument passed to the event is a player, ...so always do that.
        case 'done':
          socket.setLocale("en");
          socket.setLocation(players.getDefaultLocation());

          // create the pfile then send them on their way
          socket.save(() => {
            players.addPlayer(socket);
            socket.prompt();
            socket.getSocket()
              .emit('commands', socket);
          });

          util.log("A NEW CHALLENGER APPROACHES: ", socket);
          break;

      }
    }
  },

  configure: function (config) {
    players  = players  || config.players;
    items    = items    || config.items;
    rooms    = rooms    || config.rooms;
    npcs     = npcs     || config.npcs;
    accounts = accounts || config.accounts;

    const requiresConfig = ['login'];

    if (!l10n) {
      util.log("Loading event l10n... ");
      l10n = l10nHelper(l10nFile);
      util.log("Done");
    }

    l10n.setLocale(config.locale);

    for (const event in Events.events) {
      const injector = Events.events[event];
      //FIXME: temp kludge lolz
      if (requiresConfig.indexOf(event) !== -1) {
        Events.events[event] = injector(players, items, rooms, npcs, accounts, l10n);
      }
    }



    /**
     * Hijack translate to also do coloring
     * @param string text
     * @param ...
     * @return string
     */
    L = function (text) {
      return ansi(l10n.translate.apply(null, [].slice.call(arguments)));
    };
  }
};

exports.Events    = Events;
