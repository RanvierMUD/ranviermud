var util = require('util'),
    ansi = require('sty').parse,
    fs = require('fs'),

    CommandUtil = require('./command_util').CommandUtil;
	l10nHelper  = require('./l10n');
var rooms   = null;
var players = null;
var items   = null;
var npcs    = null;

/**
 * Localization
 */
var l10n = null;
var l10n_file = __dirname + '/../l10n/commands.yml';
// shortcut for l10n.translate
var L  = null;

var commands_dir = __dirname + '/../commands/';

/**
 * Commands a player can execute go here
 * Each command takes two arguments: a _string_ which is everything the user
 * typed after the command itself, and then the player that typed it.
 */
var Commands = {
	player_commands : {},

	/**
	 * Configure the commands by using a joint players/rooms array
	 * and loading the l10n. The config object should look similar to
	 * {
	 *   rooms: instanceOfRoomsHere,
	 *   players: instanceOfPlayerManager,
	 *   locale: 'en'
	 * }
	 * @param object config
	 */
	configure : function (config)
	{
		rooms   = config.rooms;
		players = config.players;
		items   = config.items;
		npcs    = config.npcs;
		util.log("Loading command l10n... ");
		// set the "default" locale to zz so it'll never have default loaded and to always force load the English values
		l10n = l10nHelper(l10n_file);
		l10n.setLocale(config.locale);
		util.log("Done");

		/**
		 * Hijack translate to also do coloring
		 * @param string text
		 * @param ...
		 * @return string
		 */
		L = function (text) {
			return ansi(l10n.translate.apply(null, [].slice.call(arguments)));
		};


		// Load external commands
		fs.readdir(commands_dir, function (err, files)
		{
			// Load any npc files
			for (j in files) {
				var command_file = commands_dir + files[j];
				if (!fs.statSync(command_file).isFile()) continue;
				if (!command_file.match(/js$/)) continue;

				var command_name = files[j].split('.')[0];

				Commands.player_commands[command_name] = require(command_file).command(rooms, items, players, npcs, Commands);
			}
		});
	},

	/**
	 * Command wasn't an actual command so scan for exits in the room
	 * that have the same name as the command typed. Skills will likely
	 * follow the same structure
	 * @param string exit direction they tried to go
	 * @param Player player
	 * @return boolean
	 */
	room_exits : function (exit, player)
	{
		var room = rooms.getAt(player.getLocation());
		if (!room)
		{
			return false;
		}

		var exits = room.getExits().filter(function (e) {
			try {
				var regex = new RegExp("^" + exit);
			}
			catch(err) {
				return false;
			}
			return e.direction.match(regex);
		});

		if (!exits.length) {
			return false;
		}

		if (exits.length > 1) {
			player.sayL10n(l10n, "AMBIG_EXIT");
			return true;
		}

		if (player.isInCombat()) {
			player.sayL10n(l10n, 'MOVE_COMBAT');
			return;
		}

		move(exits.pop(), player, players);

		return true;
	},
	setLocale : function (locale)
	{
		l10n.setLocale(locale);
	}
};

alias('exp', 'tnl');

exports.Commands = Commands;

/**
 * Move helper method
 * @param object exit See the Room class for details
 * @param Player player
 */
function move (exit, player)
{
	rooms.getAt(player.getLocation()).emit('playerLeave', player, players);

	var room = rooms.getAt(exit.location);
	if (!room)
	{
		player.sayL10n(l10n, 'LIMBO');
		return;
	}

	// Send the room leave message
	players.broadcastIf(exit.leave_message || L('LEAVE', player.getName()), function (p) {
		return p.getLocation() === player.getLocation && p != player;
	});

	players.eachExcept(player, function (p) {
		if (p.getLocation() === player.getLocation()) {
			p.prompt();
		}
	});

	player.setLocation(exit.location);
	// Force a re-look of the room
	Commands.player_commands.look(null, player);

	// Trigger the playerEnter event
	// See example in scripts/npcs/1.js
	room.getNpcs().forEach(function (id) {
		var npc = npcs.get(id);
		npc.emit('playerEnter', room, player, players);
	});

	room.emit('playerEnter', player, players);

};

/**
 * Alias commands
 * @param string name   Name of the alias E.g., l for look
 * @param string target name of the command
 */
function alias (name, target)
{
	Commands.player_commands[name] = function () {
		Commands.player_commands[target].apply(null, [].slice.call(arguments))
	};
};
