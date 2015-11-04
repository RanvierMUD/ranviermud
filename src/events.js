var crypto   = require('crypto'),
    util     = require('util'),
    ansi     = require('colorize').ansify,

    Commands = require('./commands').Commands,
    Channels = require('./channels').Channels,
    Data     = require('./data').Data,
    Item     = require('./items').Item,
    Player   = require('./player').Player,
	Skills   = require('./skills').Skills,
	l10nHelper = require('./l10n');


/**
 * Localization
 */
var l10n = null;
var l10n_file = __dirname + '/../l10n/events.yml';
// shortcut for l10n.translate
var L  = null;

var players = null;
var npcs    = null;
var rooms   = null;
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
		login : function(arg, stage, dontwelcome, name)
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


					next(arg, 'password', false, name);
					return;
				});
				break;
			case 'password':
				if (typeof password_attempts[name] === 'undefined') {
					password_attempts[name] = 0;
				}

				// Boot and log any failed password attempts
				if (password_attempts[name] > 2) {
					arg.write(L('PASSWORD_EXCEEDED') + "\r\n");
					password_attempts[name] = 0;
					util.log('Failed login - exceeded password attempts - ' + name);
					arg.end();
					return false;
				}


				if (!dontwelcome) {
					arg.write(L('PASSWORD'));
				}

				arg.once('data', function (pass)
				{
					// Skip garbage
					if (pass[0] === 0xFA) {
						return next(arg, 'password', true, name);
					}
					pass = crypto.createHash('md5').update(pass.toString('').trim()).digest('hex');
					if (pass !== Data.loadPlayer(name).password) {
						arg.write(L('PASSWORD_FAIL') + "\r\n");
						password_attempts[name] += 1;
						return repeat();
					}
					next(arg, 'done', name);
				});
				break;
			case 'done':
				var name = dontwelcome;
				// If there is a player connected with the same name boot them the heck off
				if (players.some(function (p) { return p.getName() === name; })) {
					players.eachIf(function (p) { return p.getName() === name; }, function (p) {
						p.emit('quit');
						p.say("Replaced.");
						players.removePlayer(p, true);
					});
				}

				player = new Player(arg);
				player.load(Data.loadPlayer(name));
				players.addPlayer(player);

				player.getSocket().on('close', function () { players.removePlayer(player);});
				players.broadcastL10n(l10n, 'WELCOME', player.getName());

				// Load the player's inventory (There's probably a better place to do this)
				var inv = [];
				player.getInventory().forEach(function (item) {
					item = new Item(item);
					items.addItem(item);
					inv.push(item);
				});
				player.setInventory(inv);
				player.calculateAttributes();


				Commands.player_commands.look(null, player);
				player.prompt();

				// All that shit done, let them play!
				player.getSocket().emit("commands", player);
				break;
			};
		},

		/**
		 * Command loop
		 * @param Player player
		 */
		commands : function(player)
		{
			// Parse order is commands -> exits -> skills -> channels
			player.getSocket().once('data', function (data)
			{
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

						var found = false;
						for (var cmd in Commands.player_commands) {
							try {
								var regex = new RegExp("^" + command);
							}
							catch(err) {
								continue;
							}
							if (cmd.match(regex)) {
								found = cmd;
								break;
							}
						}

						if (found !== false) {
							result = Commands.player_commands[found](args, player);
						} else {
							var exit = Commands.room_exits(command, player);
							if (exit === false) {
								if (!(command in player.getSkills())) {
									if (!(command in Channels)) {
										player.say(command + " is not a valid command.");
										result = true;
									} else {
										Channels[command].use(args, player, players);
									}
								} else {
									result = player.useSkill(command, player, args, rooms, npcs);
								}
							}
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
		 *   name:   ... get their name
		 *   password: 	get their password
		 *	 class: 	get their class
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
				//arg.write("What language would you like to play in? [English, Spanish] ");
				//arg.once('data', function (locale)
				//{
					var locales = {
						english: 'en',
						spanish: 'es'
					};
				//	locale = locale.toString().trim().toLowerCase();
				//	if (!(locale in locales)) {
				//		arg.write("Sorry, that's not a valid language.\r\n");
				//		return repeat();
				//	}
				//
					arg = new Player(arg);
					arg.setLocale('en');	//change this if you do l10n
					next(arg, 'name');
				//});
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
					next(arg, 'class');
				});
				break;
			case 'class':
				var classes = {
					d: '[D]efender',
					t: '[T]roublemaker',
					m: '[M]ystic',
					n: 'Ti[n]kerer'
				};
				arg.sayL10n(l10n, 'CLASS_SELECT');
				for (var r in classes) {
					arg.say(classes[r]);
				}
				arg.getSocket().once('data', function (cls) {
					cls = cls.toString().trim().toLowerCase();
					var classes = {
					d: "defender",
					t: "troublemaker",
					m: 'mystic',
					n: 'tinkerer'
					}; // REFACTOR -- not DRY
					if (!(cls in classes)) {
						if (cls === 'help'){
							console.log("Help message sending...");
							arg.say("Defender:\nThe Defender was in training to become a guardian of civilization before the crisis. They are strong and hardy, having skills that allow them to turn the tide of battle through physical force and smart manuevering. They are masters of melee combat and survival. \n \nTroublemaker:\nThe Troublemaker uses sleight of hand, personality, and dexterity to make a fool out of their marks. These folks have no formal training but have most likely grown up on the streets as pickpockets, entertainers, street businesspeople, or rogues. They are experts in tricking their opponents, and excel at ranged combat and stealth. \n \nMystic:\nThe Mystic is a scholar of the arcane art and has tapped into the psionic powers of their own mind, and their environs. They harness these powers to heal their allies and harm their opponents in unexpected ways. However, they are academics and as such, are a bit squishy.\n \nTinkerer:\nThe Tinkerer uses gadgets, machines, and steam power to enhance their natural abilities. They can fix anything, and turn a pile of junk into a working piece of equipment. They are brilliant, but not strong.");

						}
						else
							arg.sayL10n(l10n,'INVALID_CLASS');
						return repeat();
					}
					arg.setAttribute('class', classes[cls]);
					next(arg, 'attr');
				});
				break;
			

			case 'attr':
				
				//have a total amount of attribute points (25? 30?)
				var attrPool = 25;
				
				// show all attributes and allow player to add to or deduct from each

				var done = false;

				var attributes = {
					s: {name: 'strength', value: 1, 
						help: 'Strength determines your health and your damage output in melee combat.'},
					p: {name: 'speed', value: 1,
						help: 'Speed determines your attack speed, casting speed, and your chance to dodge an attack.'},
					i: {name: 'intelligence', value: 1,
						help: 'Intelligence determines your casting speed, psionic abilities, and your chance to dodge an attack.'},
					w: {name: 'willpower', value: 1,
						help: 'Willpower determines your health and your defenses.'},
					c: {name: 'charisma', value: 1,
						help: 'Charisma determines your psionic powers and helps when interacting with certain NPCs.'}
				};
					// This can't be done with a "getSocket().once", or - to do so - needs a state machine. Removing this functionality for now
					/*

				//while(!done){

					var attributeMenu = {
						s: '[S]trength',
						p: 'S[p]eed',
						i: '[I]ntelligence',
						w: '[W]illpower',
						c: '[C]harisma'
					};
					arg.say("Select an attribute. You will see an explanation of the attribute and you may add or subtract points. Type 'done' when you are finished. You currently have " + attrPool + " points left to assign.");
					for (var a in attributeMenu) {
						arg.say(attributeMenu[a]);
					}



					// when player chooses an attribute, they are shown an explanation of what it does and they can set the amount if they have enough points in the pool.
					console.log('before attribute socket function...');

					arg.getSocket().once('data', function (attr) {
						console.log('in attribute socket function...');
						attr = attr.toString().trim().toLowerCase();
					 	// REFACTOR -- not DRY
						console.log (attr);
						// allow player to type 'done' to move on to next stage.
						if (!(attr in attributes)) {
							if (attr === 'done'){
								
								// add a loop here to input every attribute into the player config
								done = true; // this might be better applied below *** 
								next(arg, 'done');
							}

						else {
								arg.say("Invalid input.");
								return repeat();  
							}
						}
							//say the selection, help info, and current value...
						var selection = attributes[attr];
						var done = false;
						console.log('selection::', selection);
						while(!done){
						arg.say(selection.name.toUpperCase() + ": " + selection.help + "\n Maximum value: 10\n Current value: " + selection.value + "\nPlease input the number of points you would like to assign to " + selection.name + " or type 'done' to head back to the attributes menu.");

						//user inputs points or types done...
						arg.getSocket().once('data', function (pts) {
							console.log ('got points -- ' + pts);

						// if it is not a number, checks to see if they typed done, else it repeats this bit. 
							console.log(pts);
							if (parseInt(pts) == NaN){
								console.log('pts');
								pts = pts.toString().trim().toLowerCase();
								console.log ('checks for string');
								if (pts === 'done') {
									console.log ('done is incomplete, this is the oops')
									// ***
									// somehow cache their final value
									done = true;
								} 
								else 
									arg.say("Invalid input.");
									return repeat();
							}
							console.log('made it through if/then loop for string... are they not all strings?!?');
							pts = parseInt(pts);
							console.log(pts);
							if (pts < 0 || pts > attrPool){
								arg.say("Invalid input.");
								return repeat();
							}
							if (pts < selection.value){
								attrPool += selection.value - pts;
								selection.value = pts;
								console.log(selection + ' new value is ' + selection.value);
								console.log('pool is now ' + attrPool);
								// they are lowering the value, so the difference should go back into the pool.
							}
							else {

								// refactor into function to be DRY
								attrPool += selection.value - pts; 
								console.log(selection + ' new value is ' + selection.value);
								console.log('pool is now ' + attrPool);

								// they are raising the value
								selection.value = pts;
							}

						});
					}

					//cache the results here somehow -- have an empty attr object made before the switch statement
					return repeat();
				});

				// i think it needs to loop, until done, then be passed to 'done' -- that is why it hangs.
				break;
				*/

				// 'done' assumes the argument passed to the event is a player, ...so always do that.
			case 'done':
				arg.calculateAttributes();
				arg.setLocation(players.getDefaultLocation());
				// create the pfile then send them on their way
				arg.save(function () {
					players.addPlayer(arg);
					arg.prompt();
					arg.getSocket().emit('commands', arg);
				});
				break;

			}
		}
	},
	configure: function (config)
	{
		players = players || config.players;
		items   = items   || config.items;
		rooms   = rooms   || config.rooms;
		npcs    = npcs    || config.npcs;
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

