var crypto = require('crypto'),
  util = require('util'),
  ansi = require('colorize')
  .ansify,

  Commands = require('./commands')
  .Commands,
  Channels = require('./channels')
  .Channels,
  Data = require('./data')
  .Data,
  Item = require('./items')
  .Item,
  Player = require('./player')
  .Player,
  Skills = require('./skills')
  .Skills,
  l10nHelper = require('./l10n');


/**
 * Localization
 */
var l10n = null;
var l10n_file = __dirname + '/../l10n/events.yml';
// shortcut for l10n.translate
var L = null;

var players = null;
var npcs = null;
var rooms = null;
var items = null;

// Keep track of password attempts
var password_attempts = {};

/**
 * Helper for advancing staged events
 * @param string stage
 * @param object firstarg Override for the default arg
 */
var gen_next = function (event) {
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
var gen_repeat = function (repeat_args, next) {
  return function () {
    next.apply(null, [].slice.call(repeat_args))
  };
};

/**
 * Events object is a container for any "context switches" for the player.
 * Essentially anything that requires player input will have its own listener
 * if it isn't just a basic command. Complex listeners are staged.
 * See login or createPlayer for examples
 */
var Events = {
  /**
   * Container for events
   * @var object
   */
  events: {
    /**
     * Point of entry for the player. They aren't actually a player yet
     * @param Socket socket
     */
    login: function login(socket, stage, dontwelcome, name) {

      util.log("Login event detected... ", stage);

      // dontwelcome is used to swallow telnet bullshit
      dontwelcome = typeof dontwelcome == -'undefined' ? false :
        dontwelcome;
      stage = stage || 'intro';

      if (socket instanceof Player) {
        l10n.setLocale('en');
      }

      var next = gen_next('login');
      var repeat = gen_repeat(arguments, next);

      switch (stage) {

        case 'intro':
          var motd = Data.loadMotd();
          if (motd) socket.write(motd);
          next(socket, 'login');
          break;

        case 'login':
          if (!dontwelcome) {
            socket.write("Welcome, what is your name? ");
          }

          socket.once('data', function (name) {

            // swallow any data that's not from player input i.e., doesn't end with a newline
            // Windows can s@#* a d@#$
            var negot = false;
            if (name[name.length - 1] === 0x0a) {
              negot = true;
            } else if (name[name.length - 1] === 0x0d) {
              negot = true;
            }

            if (!negot) {
              next(socket, 'login', true);
              return;
            }

            var name = name.toString()
              .trim();
            if (/[^a-z]/i.test(name) || !name) {
              socket.write("That's not really your name, now is it?\r\n");
              return repeat();
            }

            name = name[0].toUpperCase() + name.toLowerCase()
              .substr(1);

            var data = Data.loadPlayer(name);

            // That player doesn't exit so ask if them to create it
            if (!data) {
              socket.emit('createPlayer', socket);
              return;
            }


            next(socket, 'password', false, name);
            return;
          });
          break;

        case 'password':
          if (typeof password_attempts[name] === 'undefined') {
            password_attempts[name] = 0;
          }

          // Boot and log any failed password attempts
          if (password_attempts[name] > 2) {
            socket.write(L('PASSWORD_EXCEEDED') + "\r\n");
            password_attempts[name] = 0;
            util.log('Failed login - exceeded password attempts - ' + name);
            socket.end();
            return false;
          }


          if (!dontwelcome) {
            socket.write(L('PASSWORD'));
          }

          socket.once('data', pass => {
            // Skip garbage
            if (pass[0] === 0xFA) {
              return next(socket, 'password', true, name);
            }

            pass = crypto
              .createHash('md5')
              .update(pass.toString('').trim())
              .digest('hex');

            if (pass !== Data.loadPlayer(name).password) {
              util.log("Failed password attempt by ", socket)
              socket.write(L('PASSWORD_FAIL') + "\r\n");
              password_attempts[name] += 1;
              return repeat();
            }
            next(socket, 'done', name);
          });
          break;


        case 'done':
          var name = dontwelcome;
          var haveSameName = p => p.getName().toLowerCase() === name.toLowerCase();
          var boot = players.some(haveSameName);

          if (boot) {
            players.eachIf(haveSameName,
              p => {
                p.say("Replaced.");
                p.emit('quit');
                util.log("Replaced: ", p.getName());
                players.removePlayer(p, true);
              });
          }

          player = new Player(socket);
          player.load(Data.loadPlayer(name));
          players.addPlayer(player);

          player.getSocket()
            .on('close', () => {
              players.removePlayer(player);
            });
          players.broadcastL10n(l10n, 'WELCOME_BACK', player.getName());

          // Load the player's inventory (There's probably a better place to do this)
          var inv = [];
          player.getInventory()
            .forEach(function (item) {
              item = new Item(item);
              items.addItem(item);
              inv.push(item);
            });
          player.setInventory(inv);


          Commands.player_commands.look(null, player);
          player.prompt();

          // All that shit done, let them play!
          player.getSocket()
            .emit("commands", player);
          break;
      };
    },

    /**
     * Command loop
     * @param Player player
     */
    commands: function (player) {
      // Parse order is common direction shortcuts -> commands -> exits -> skills -> channels
      player.getSocket()
        .once('data', function (data) {
          data = data.toString()
            .trim();

          var result;
          if (data) result = parseCommands(data);
          if (result !== false) commandPrompt();

          // Methods

          function parseCommands(data) {
            var command = data.split(' ')
              .shift();
            var args = data.split(' ')
              .slice(1)
              .join(' ');

            var found = false;

            if (!(command in Commands.player_commands)) {

              found = checkForDirectionAlias(command);
              if (!found) found = checkForCmd(command);
              else if (found === true) return;

              if (found) return getCmd(found, args);
              else return checkForSpecializedCommand(command, args);

            } else return getCmd(command, args);
          }

          function getCmd(cmd, args) {
            try {
              return Commands.player_commands[cmd](args, player);
            } catch (e) { util.log(e) }
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


          function checkForCmd(command) {
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
     * Create a player
     * Stages:
     *   check:  See if they actually want to create a player or not
     *   locale: Get the language they want to play in so we can give them
     *           the rest of the creation process in their language
     *   name:   ... get there name
     *   done:   This is always the end step, here we register them in with
     *           the rest of the logged in players and where they log in
     *
     * @param object arg This is either a Socket or a Player depending on
     *                  the stage.
     * @param string stage See above
     */
    createPlayer: function (socket, stage) {
      stage = stage || 'check';

      if (socket instanceof Player) {
        l10n.setLocale("en");
      }

      var next = gen_next('createPlayer');
      var repeat = gen_repeat(arguments, next);

      /* Multi-stage character creation i.e., races, classes, etc.
       * Always emit 'done' in your last stage to keep it clean
       * Also try to put the cases in order that they happen during creation
       */
      switch (stage) {
        case 'check':
          socket.write(
            "That player doesn't exist, would you like to create it? [y/n] "
          );
          socket.once('data', function (check) {
            check = check.toString()
              .trim()
              .toLowerCase();
            if (!/[yn]/.test(check)) {
              return repeat();
            }

            if (check === 'n') {
              socket.write("Goodbye!\r\n");
              socket.end();
              return false;
            }

            next(socket, 'name');
          });
          break;
        case 'name':
          socket = new Player(socket);
          socket.write(L('NAME_PROMPT'));
          socket.getSocket()
            .once('data', function (name) {
              name = name.toString()
                .trim();
              if (/\W/.test(name)) {
                socket.say(L('INVALID_NAME'));
                return repeat();
              }

              var player = false;
              players.every(function (p) {
                if (p.getName()
                  .toLowerCase() === name.toLowerCase()) {
                  player = true;
                  return false;
                }
                return true;
              });

              player = player || Data.loadPlayer(name);

              if (player) {
                socket.say(L('NAME_TAKEN'));
                return repeat();
              }

              // Always give them a name like Shawn instead of sHaWn
              socket.setName(name[0].toUpperCase() + name.toLowerCase()
                .substr(
                  1));
              next(socket, 'password');
            });
          break;
        case 'password':
          socket.write(L('PASSWORD'));
          socket.getSocket()
            .once('data', function (pass) {
              pass = pass.toString()
                .trim();
              if (!pass) {
                socket.sayL10n(l10n, 'EMPTY_PASS');
                return repeat();
              }

              // setPassword handles hashing
              socket.setPassword(pass);
              next(socket, 'gender');
            });
          break;
        case 'gender':
          socket.write(
            'What is your character\'s gender?\n[F]emale\n[M]ale\n[A]ndrogynous\n'
          );
          socket.getSocket()
            .once('data', function (gender) {
              gender = gender.toString()
                .toLowerCase();
              if (!gender) {
                socket.say(
                  'Please specify a gender, or [A]ndrogynous if you\'d prefer not to.'
                );
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
          socket.save(function () {
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
    players = players || config.players;
    items = items || config.items;
    rooms = rooms || config.rooms;
    npcs = npcs || config.npcs;
    if (!l10n) {
      util.log("Loading event l10n... ");
      l10n = l10nHelper(l10n_file);
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
exports.Events = Events;
