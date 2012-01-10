var Localize = require('localize'),
    util = require('util'),
	ansi = require('sty').parse,
	sprintf = require('sprintf').sprintf;

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

/**
 * Commands a player can execute go here
 * Each command takes two arguments: a _string_ which is everything the user
 * typed after the command itself, and then the player that typed it.
 */
var Commands = {
	player_commands : {
		commands: function (args, player)
		{
			var commands = [];
			var maxlength = 0;
			for (var command in Commands.player_commands) {
				if (command.length > maxlength) maxlength = command.length;
				commands.push(command);
			}

			for (var i = 1; i < commands.length+1; i++) {
				player[i % 5 === 0? 'say' : 'write'](sprintf('%-' + (maxlength + 1) + 's', commands[i-1]));
			}
		},
		drop: function (args, player)
		{
			var room = rooms.getAt(player.getLocation());
			var item = find_item_in_inventory(args, player, true);

			if (!item) {
				player.sayL10n(l10n, 'ITEM_NOT_FOUND');
				return;
			}

			if (item.isEquipped()) {
				player.sayL10n(l10n, 'ITEM_WORN');
				return;
			}

			player.say(L('ITEM_DROP', item.getShortDesc(player.getLocale())), false);
			players.broadcastExceptL10n(player, l10n, 'ITEM_DROPPED', player.getName(), function (p) { return item.getShortDesc(p.getLocale()); });
			room.getNpcs().forEach(function (id) {
				npcs.get(id).emit('playerDropItem', room, player, players, item);
			});

			player.removeItem(item);
			room.addItem(item.getUuid());
			item.setInventory(null);
			item.setRoom(room.getLocation());
		},
		equipment: function (args, player)
		{
			var equipped = player.getEquipped();
			for (var i in equipped) {
				var item = items.get(equipped[i]);
				player.say(sprintf("%-15s %s", "<" + i + ">", item.getShortDesc(player.getLocale())));
			}
		},
		get: function (args, player)
		{
			var room = rooms.getAt(player.getLocation());
			if (player.getInventory().length >= 20) {
				player.sayL10n(l10n, 'CARRY_MAX');
				return;
			}

			var item = find_item_in_room(args, room, player);
			if (!item) {
				player.sayL10n(l10n, 'ITEM_NOT_FOUND');
				return;
			}

			item = items.get(item);

			player.sayL10n(l10n, 'ITEM_PICKUP', item.getShortDesc(player.getLocale()));
			item.setRoom(null);
			item.setInventory(player.getName());
			player.addItem(item);
			room.removeItem(item.getUuid());
		},
		inventory: function (args, player)
		{
			player.sayL10n(l10n, 'INV');

			// See how many of an item a player has so we can do stuff like (2) apple
			var itemcounts = {};
			player.getInventory().forEach(function (i) {
				if (!i.isEquipped()) {
					itemcounts[i.getVnum()] ? itemcounts[i.getVnum()] += 1 : itemcounts[i.getVnum()] = 1;
				}
			});

			var displayed = {};
			player.getInventory().forEach(function (i) {
				if (!(i.getVnum() in displayed) && !i.isEquipped()) {
					displayed[i.getVnum()] = 1;
					player.say((itemcounts[i.getVnum()] > 1 ? '(' + itemcounts[i.getVnum()] + ') ' : '') + i.getShortDesc(player.getLocale()));
				}
			});
		},
		look: function (args, player)
		{
			var room = rooms.getAt(player.getLocation());

			if (args) {
				// Look at items in the room first
				var thing = find_item_in_room(args, room, player, true);

				if (!thing) {
					// Then the inventory
					thing = find_item_in_inventory(args, player, true);
				}

				if (!thing) {
					// then for an NPC
					thing = find_npc_in_room(args, room, player, true);
				}

				// TODO: look at players

				if (!thing) {
					player.sayL10n(l10n, 'ITEM_NOT_FOUND');
					return;
				}

				player.say(thing.getDescription(player.getLocale()));
				return;
			}


			if (!room)
			{
				player.sayL10n(l10n, 'LIMBO');
				return;
			}

			// Render the room and its exits
			player.say(room.getTitle(player.getLocale()));
			player.say(room.getDescription(player.getLocale()));
			player.say('');

			// display players in the same room
			players.eachIf(function (p) {
				return (p.getName() !== player.getName() && p.getLocation() === player.getLocation());
			}, function (p) {
				player.sayL10n(l10n, 'IN_ROOM', p.getName());
			});

			// show all the items in the rom
			room.getItems().forEach(function (id) {
				player.say('<magenta>' + items.get(id).getShortDesc(player.getLocale()) + '</magenta>');
			});

			// show all npcs in the room
			room.getNpcs().forEach(function (id) {
				player.say('<cyan>' + npcs.get(id).getShortDesc(player.getLocale()) + '</cyan>');
			});

			player.write('[');
			player.writeL10n(l10n, 'EXITS');
			player.write(': ');
			room.getExits().forEach(function (exit) {
				player.write(exit.direction + ' ');
			});
			player.say(']');
		},
		quit: function (args, player)
		{
			players.removePlayer(player, true);
			return false;
		},
		save: function (args, player)
		{
			player.save(function () {
				player.say(L('SAVED'));
			});
		},
		remove: function (args, player)
		{
			thing = find_item_in_inventory(args.split(' ')[0], player, true);
			if (!thing) {
				player.sayL10n(l10n, 'ITEM_NOT_FOUND');
				return;
			}

			if (!thing.isEquipped()) {
				player.sayL10n(l10n, 'ITEM_NOT_EQUIPPED');
				return;
			}

			player.unequip(thing);
		},
		say: function (args, player)
		{
			var location = player.getLocation();
			args = args.replace("\033", '');
			players.broadcastL10n(l10n, 'SAY', player.getName(), args);
			players.eachExcept(player, function (p) { p.prompt(); });
		},
		wield: function (args, player)
		{
			var thing = args.split(' ')[0];
			thing = find_item_in_inventory(thing, player, true);
			if (!thing) {
				player.sayL10n(l10n, 'ITEM_NOT_FOUND');
				return;
			}
			thing.emit('wield', 'wield', player, players);

		},
		where: function (args, player)
		{
			player.write(player.getLocation() + "\n");
		},
		who: function (args, player)
		{
			players.each(function (p) {
				player.say(p.getName());
			});
		},
	},

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
			l10n = new Localize(require('js-yaml').load(require('fs').readFileSync(l10n_file).toString('utf8')), undefined, 'zz');
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
		var found_exit = false;
		var room = rooms.getAt(player.getLocation());
		if (!room)
		{
			return false;
		}

		room.getExits().forEach(function (e) {
			if (exit === e.direction) {
				found_exit = true;
				move(e, player, players);
			}
		});
		return found_exit;
	},
	setLocale : function (locale)
	{
		l10n.setLocale(locale);
	}
};

alias('l',   'look');
alias('inv', 'inventory');
alias('eq',  'equipment');
alias('rem', 'remove');

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
 * Find an item in a room based on the syntax
 *   things like: get 2.thing or look 6.thing or look thing
 * @param string look_string
 * @param Room   room
 * @param Player player
 * @param boolean hydrade Whether to return the id or a full object
 * @return string UUID of the item
 */
function find_item_in_room (look_string, room, player, hydrate)
{
	hydrate = hydrate || false;
	var keyword = look_string.split(' ')[0];
	var multi = false;
	var nth = null;
	// Are they trying to get the nth item of a keyword?
	if (/^\d+\./.test(keyword)) {
		nth = parseInt(keyword.split('.')[0], 10);
		keyword = keyword.split('.')[1];
		multi = true
	}

	var found = [];
	room.getItems().forEach(function (id) {
		var item = items.get(id);

		if (item.hasKeyword(keyword, player.getLocale())) {
			found.push(hydrate ? item : id);
		}
	});

	if (!found.length) {
		return false;
	}

	var item = null;
	if (multi && !isNaN(nth) && nth && nth <= found.length) {
		item = found[nth-1];
	} else {
		item = found[0];
	}

	return item;
}

/**
 * Find an npc in a room based on the syntax
 *   things like: get 2.thing or look 6.thing or look thing
 * @param string look_string
 * @param Room   room
 * @param Player player
 * @param boolean hydrade Whether to return the id or a full object
 * @return string UUID of the item
 */
function find_npc_in_room (look_string, room, player, hydrate)
{
	hydrate = hydrate || false;
	var keyword = look_string.split(' ')[0];
	var multi = false;
	var nth = null;
	// Are they trying to get the nth item of a keyword?
	if (/^\d+\./.test(keyword)) {
		nth = parseInt(keyword.split('.')[0], 10);
		keyword = keyword.split('.')[1];
		multi = true
	}

	var found = [];
	room.getNpcs().forEach(function (id) {
		var npc = npcs.get(id);

		if (npc.hasKeyword(keyword, player.getLocale())) {
			found.push(hydrate ? npc : id);
		}
	});

	if (!found.length) {
		return false;
	}

	var item = null;
	if (multi && !isNaN(nth) && nth && nth <= found.length) {
		item = found[nth-1];
	} else {
		item = found[0];
	}

	return item;
}

/**
 * Find an item in a room based on the syntax
 *   things like: get 2.thing or look 6.thing or look thing
 * @param string look_string
 * @param object being This could be a player or NPC. Though most likely player
 * @return string UUID of the item
 */
function find_item_in_inventory (look_string, being, hydrate)
{
	hydrate = hydrate || false;
	var keyword = look_string.split(' ')[0];
	var multi = false;
	var nth = null;
	// Are they trying to get the nth item of a keyword?
	if (/^\d+\./.test(keyword)) {
		nth = parseInt(keyword.split('.')[0], 10);
		keyword = keyword.split('.')[1];
		multi = true
	}

	var found = [];
	being.getInventory().forEach(function (item) {
		if (item.hasKeyword(keyword, being.getLocale())) {
			found.push(hydrate ? item : item.getUuid());
		}
	});

	if (!found.length) {
		return false;
	}

	var item = null;
	if (multi && !isNaN(nth) && nth && nth <= found.length) {
		item = found[nth-1];
	} else {
		item = found[0];
	}

	return item;
}

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
