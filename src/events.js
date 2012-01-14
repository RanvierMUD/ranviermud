var hashlib  = require('hashlib'),
    Localize = require('localize'),
    util     = require('util'),
    ansi     = require('colorize').ansify,

    Commands = require('./commands').Commands,
    Data     = require('./data').Data,
    Item     = require('./items').Item,
    Player   = require('./player').Player;


/**
 * Localization
 */
var l10n = null;
var l10n_file = __dirname + '/../l10n/events.yml';
// shortcut for l10n.translate
var L  = null;

var players = null;
var items   = null;

// Keep track of password attempts
var password_attempts = {};

/**
* Helper for advancing staged events
* @param string stage
* @param object firstarg Override for the default arg
*/
var gen_next = function (event)
{
	/**
	 * Move to the next stage of a staged event
	 * @param Socket|Player arg       Either a Socket or Player on which emit() will be called
	 * @param string        nextstage
	 * @param ...
	 */
	return function (arg, nextstage) {
		func = (arg instanceof Player ? arg.getSocket() : arg);
		func.emit.apply(func, [event].concat([].slice.call(arguments)));
	}
};

/**
 * Helper for repeating staged events
 * @param Array repeat_args
 * @return function
 */
var gen_repeat = function (repeat_args, next)
{
	return function () { next.apply(null, [].slice.call(repeat_args)) };
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
		login : function(arg, stage, dontwelcome)
		{
			// dontwelcome is used to swallow telnet bullshit
			dontwelcome = typeof dontwelcome ==-'undefined' ? false : dontwelcome;
			stage = stage || 'intro';

			if (arg instanceof Player) {
				l10n.setLocale(arg.getLocale());
			}

			var next   = gen_next('login');
			var repeat = gen_repeat(arguments, next);

			switch (stage)
			{
			case 'intro':
				var motd = Data.loadMotd();
				if (motd) {
					arg.write(motd);
				}
				next(arg, 'login');
				break;
			case 'login':
				if (!dontwelcome) {
					arg.write("Welcome, what is your name? ");
				}

				arg.once('data', function (name) {
					// swallow any data that's not from player input i.e., doesn't end with a newline
					// Windows can s@#* a d@#$
					var negot = false;
					if (name[name.length - 1] === 0x0a) {
						negot = true;
					} else if (name[name.length - 1] === 0x0d) {
						negot = true;
					}

					if (!negot) {
						next(arg, 'login', true);
						return;
					}

					var name = name.toString().trim();
					if (/[^a-z]/i.test(name) || !name) {
						arg.write("That's not really your name, now is it?\r\n");
						return repeat();
					}

					name = name[0].toUpperCase() + name.toLowerCase().substr(1);
					var data = Data.loadPlayer(name);

					// That player doesn't exit so ask if them to create it
					if (!data) {
						arg.emit('createPlayer', arg);
						return;
					}

					player = new Player(arg);
					player.load(data);

					next(player, 'password');
					return;
				});
				break;
			case 'password':
				if (typeof password_attempts[arg.getName()] === 'undefined') {
					password_attempts[arg.getName()] = 0;
				}

				// Boot and log any failed password attempts
				if (password_attempts[arg.getName()] > 2) {
					arg.say(L('PASSWORD_EXCEEDED'));
					password_attempts[arg.getName()] = 0;
					util.log('Failed login - exceeded password attempts - ' + arg.getName());
					arg.getSocket().end();
					return false;
				}

				
				arg.getSocket().write(L('PASSWORD'));
				arg.getSocket().once('data', function (pass) {
					pass = hashlib.md5(pass.toString().trim());
					if (pass !== arg.getPassword()) {
						arg.sayL10n(l10n, 'PASSWORD_FAIL');
						password_attempts[arg.getName()] += 1;
						return repeat();
					}
					next(arg, 'done');
				});
				break;
			case 'done':
				players.addPlayer(arg);
				arg.sayL10n(l10n, 'WELCOME', arg.getName());

				// Load the player's inventory (There's probably a better place to do this)
				var inv = [];
				arg.getInventory().forEach(function (item) {
					item = new Item(item);
					items.addItem(item);
					inv.push(item);
				});
				arg.setInventory(inv);


				Commands.player_commands.look(null, arg);
				arg.prompt();

				// All that shit done, let them play!
				arg.getSocket().emit("commands", arg);
				break;
			};
		},

		/**
		 * Command loop
		 * @param Player player
		 */
		commands : function(player)
		{
			player.getSocket().once('data', function (data) {
				data = data.toString().trim();
				var result;
				if (data) {
					var command = data.split(' ').shift();
					var args    = data.split(' ').slice(1).join(' ');
					// TODO: Implement a BASH like \command to force a command
					// if an exit shares a name
					if (!(command in Commands.player_commands)) {
						// They typed a command that doesn't exist, check to see if there's
						// an exit with that name in the room

						var exit = Commands.room_exits(command, player);
						if (exit === false) {
							player.say(command + " is not a valid command.");
							result = true;
						}
					} else {
						result = Commands.player_commands[command](args, player);
					}
				}

				if (result !== false) {
					player.prompt();
					player.getSocket().emit("commands", player);
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
		createPlayer : function (arg, stage)
		{
			stage = stage || 'check';

			if (arg instanceof Player) {
				l10n.setLocale(arg.getLocale());
			}

			var next   = gen_next('createPlayer');
			var repeat = gen_repeat(arguments, next);

			/* Multi-stage character creation i.e., races, classes, etc.
			 * Always emit 'done' in your last stage to keep it clean
			 * Also try to put the cases in order that they happen during creation
			 */
			switch (stage)
			{
			case 'check':
				arg.write("That player doesn't exist, would you like to create it? [y/n] ");
				arg.once('data', function (check) {
					check = check.toString().trim().toLowerCase();
					if (!/[yn]/.test(check)) {
						return repeat();
					}

					if (check === 'n') {
						arg.write("Goodbye!\r\n");
						arg.end();
						return false;
					}

					next(arg, 'locale');
				});
				break;
			case 'locale':
				arg.write("What language would you like to play in? [English, Spanish] ");
				arg.once('data', function (locale)
				{
					var locales = {
						english: 'en',
						spanish: 'es'
					};
					locale = locale.toString().trim().toLowerCase();
					if (!(locale in locales)) {
						arg.write("Sorry, that's not a valid language.\r\n");
						return repeat();
					}

					arg = new Player(arg);
					arg.setLocale(locales[locale]);
					next(arg, 'name');
				});
				break;
			case 'name':
				arg.write(L('NAME_PROMPT'));
				arg.getSocket().once('data', function (name) {
					name = name.toString().trim();
					if (/\W/.test(name)) {
						arg.say(L('INVALID_NAME'));
						return repeat();
					}

					var player = false;
					players.every(function (p) {
						if (p.getName().toLowerCase() === name.toLowerCase()) {
							player = true;
							return false;
						}
						return true;
					});

					player = player || Data.loadPlayer(name);

					if (player) {
						arg.say(L('NAME_TAKEN'));
						return repeat();
					}

					// Always give them a name like Shawn instead of sHaWn
					arg.setName(name[0].toUpperCase() + name.toLowerCase().substr(1));
					next(arg, 'password');
				});
				break;
			case 'password':
				arg.write(L('PASSWORD'));
				arg.getSocket().once('data', function (pass) {
					pass = pass.toString().trim();
					if (!pass) {
						arg.sayL10n(l10n, 'EMPTY_PASS');
						return repeat();
					}

					// setPassword handles hashing
					arg.setPassword(pass);
					next(arg, 'done');
				});
				break;
			// 'done' assumes the argument passed to the event is a player, ...so always do that.
			case 'done':
				arg.setLocation(players.getDefaultLocation());
				// create the pfile then send them on their way
				arg.save(function () {
					players.addPlayer(arg);
					arg.prompt();
					arg.getSocket().emit('commands', arg);
				});
				break;
			/* Example stage:
			case 'race':
				var races = {h: '[H]uman', o: '[O]rc', e: '[E]lf'};
				arg.say("What race would you like to play?);
				for (var r in races) {
					arg.say(races[r]);
				}
				arg.getSocket().once('data', function (race) {
					race = race.toString().trim().toLowerCase();
					if (!(race in races)) {
						arg.say("Sorry, that's not a valid race.");
						// emitting the same event with the same action will simply repeat this stage
						// Hooray for not using stupid loops
						arg.getSocket.emit('createPlayer', arg, 'race');
						return;
					}
					var races = {h: 'human', o: 'orc', e: 'elf'};
					arg.setRace(races[race]);
					arg.getSocket().emit('createPlayer', arg, 'done');
				});
				break;
			*/
			}
		}
	},
	configure: function (config)
	{
		players = players || config.players;
		items   = items   || config.items;
		if (!l10n) {
			util.log("Loading event l10n... ");
				l10n = new Localize(require('js-yaml').load(require('fs').readFileSync(l10n_file).toString('utf8')), undefined, 'zz');
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
