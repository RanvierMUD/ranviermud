'use strict';

//FIXME: Find a way to modularize as much of this as possible.

const crypto = require('crypto'),
  util       = require('util'),
  ansi       = require('colorize').ansify,
  sty        = require('sty'),

  // TODO: Pass these all in to events funcs
  Commands   = require('./commands').Commands,
  Channels   = require('./channels').Channels,
  Data       = require('./data').Data,
  Item       = require('./items').Item,
  Player     = require('./player').Player,
  Skills     = require('./skills').Skills,
  Accounts   = require('./accounts').Accounts,
  Account    = require('./accounts').Account,

  //TODO: Deprecate this if possible.
  l10nHelper = require('./l10n');



/**
 * Localization
 */
let l10n = null;
const l10nFile = __dirname + '/../l10n/events.yml';
// shortcut for l10n.translate
let L = null;

let players  = null;
let player   = null;
let npcs     = null;
let rooms    = null;
let items    = null;
let account  = null;
let accounts = null;

const gen_say = socket => string => socket.write(sty.parse(string));
const EventUtil = {
  gen_next,
  gen_repeat,
  gen_say,

  capitalize,
  isNegot,
  swallowGarbage,
};


// Swallows telnet bullshit
function swallowGarbage(dontwelcome) {
  return typeof dontwelcome == -'undefined' ?
    false : dontwelcome;
}

/**
 * Helper for advancing staged events
 * @param string stage
 * @param object firstarg Override for the default arg
 */
function gen_next(event) {
  /**
   * Move to the next stage of a staged event
   * @param Socket|Player socket       Either a Socket or Player on which emit() will be called
   * @param string        nextstage
   * @param ...
   */
  return function (socket, nextstage) {
    var func = (socket instanceof Player ? socket.getSocket() : socket);
    func.emit.apply(func, [event].concat([].slice.call(arguments)));
  }
};

/**
 * Helper for repeating staged events
 * @param Array repeat_args
 * @return function
 */
function gen_repeat(repeat_args, next) {
  return function () {
    next.apply(null, [].slice.call(repeat_args))
  };
};

// Decides if stuff is actually player input or no.
function isNegot(buffer) {
  return buffer[buffer.length - 1] === 0x0a || buffer[buffer.length - 1] === 0x0d;
}

// Does what it says on the box
function capitalize(str) {
  return str[0].toUpperCase()
       + str.toLowerCase().substr(1);
}


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
     * @param Socket socket
     */
    login: function(){},

    /**
     * Command loop
     * @param Player player
     */
    commands: function (player) {
      // Parse order is common direction shortcuts -> commands -> exits -> skills -> channels
      player.getSocket()
        .once('data', function (data) {
          data = data.toString().trim();

          var result;
          if (data) { result = parseCommands(data); }
          if (result !== false) { commandPrompt(); }

          // Methods

          function parseCommands(data) {
            var command = data
              .split(' ')
              .shift();
            var args = data
              .split(' ')
              .slice(1)
              .join(' ');

            var found = false;

            // Kludge so that 'l' alone will always force a look, instead of mixing it up with lock.
            if (command === 'l') {
              return Commands.player_commands.look(args, player);
            }

            if (command[0] === '@') {
              const adminCommand = command.slice(1);
              if (adminCommand in Commands.admin_commands) {
                Commands.admin_commands[adminCommand](player, args);
                return;
              }
            }

            if (!(command in Commands.player_commands)) {

              found = checkForDirectionAlias(command);
              if (!found) { found = checkForCommandSafely(command); }
              else if (found === true) { return; }

              if (found) { return executeCommand(found, args); }
              else { return checkForSpecializedCommand(command, args); }

            } else { return executeCommand(command, args); }
          }

          function executeCommand(cmd, args) {
            try {
              return Commands.player_commands[cmd](args, player);
            } catch (e) {
              util.log(cmd);
              util.log(e);
            }
          }

          function checkForDirectionAlias(command) {
            var directions = {
              'n': 'north',
              'e': 'east',
              's': 'south',
              'w': 'west',
              'u': 'up',
              'd': 'down'
            };

            if (command.toLowerCase() in directions) {
              const exit = directions[command.toLowerCase()];
              Commands.room_exits(exit, player);
              return true;
            }
          }


          function checkForCommandSafely(command) {
            for (var cmd in Commands.player_commands) {
              try {
                var regex = new RegExp("^" + command);
              } catch (err) {
                continue;
              }
              if (cmd.match(regex)) {
                return cmd;
              }
            }
          }

          // Handles skills, feats, exits
          function checkForSpecializedCommand(command, args) {
            var exit = Commands.room_exits(command, player);

            //TODO: Refactor as to not rely on negative conditionals as much?
            if (exit === false) {
              var isSkill = command in player.getSkills();
              var isFeat = command in player.getFeats();

              if (!isSkill && !isFeat) {
                if (!(command in Channels)) {
                  player.say(command + " is not a valid command.");
                  return true;
                } else {
                  Channels[command].use(args, player, players, rooms);
                  return true
                }
              } else {
                var use = isSkill ? player.useSkill : player.useFeat;
                use(command, player, args, rooms, npcs, players);
                return true;
              }
            }
          }

          function commandPrompt() {
            player.prompt();
            player.getSocket()
              .emit("commands", player);
          }

        });
    },

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

      const say = string => socket.write(sty.parse(string));

      stage = stage || 'check';

      l10n.setLocale('en');

      var next = gen_next('createAccount');
      var repeat = gen_repeat(arguments, next);

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

      const say = string => socket.write(sty.parse(string));
      l10n.setLocale("en");

      var next   = gen_next('createPlayer');
      var repeat = gen_repeat(arguments, next);

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
          players.broadcastL10n(l10n, 'WELCOME', socket.getName());
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

    //TODO: Might have to set up event functions here after they are modularized.

    if (!l10n) {
      util.log("Loading event l10n... ");
      l10n = l10nHelper(l10nFile);
      util.log("Done");
    }
    l10n.setLocale(config.locale);

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
exports.Events     = Events;
exports.EventUtil = EventUtil;
