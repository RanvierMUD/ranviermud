var Data    = require('./data').Data,
    hashlib = require('hashlib'),
    ansi    = require('sty');

var Player = function(socket) {
	var self = this;
	self.name     = '';
	self.location = null;
	self.locale   = null;
	self.prompt_string = '>';
	self.password = null;
	self.inventory = [];
	self.equipment = {};

	// In combat is either false or an NPC vnum
	self.in_combat = false;

	/**#@+
	 * Mutators
	 */
	self.getPromptString = function () { return self.prompt_string; };
	self.getLocale       = function () { return self.locale; };
	self.getName         = function () { return self.name; };
	self.getLocation     = function () { return self.location; };
	self.getSocket       = function () { return socket; };
	self.getInventory    = function () { return self.inventory; };
	// Note, only retreives hash, not a real password
	self.getPassword     = function () { return self.password; };
	self.getEquipped     = function (slot) { return slot ? self.equipment[slot] : self.equipment; };
	self.isInCombat      = function () { return self.in_combat; };
	self.setPromptString = function (prompt_string) { self.prompt_string = prompt_string; }
	self.setLocale       = function (locale)        { self.locale = locale; };
	self.setName         = function (newname)       { self.name = newname; };
	self.setLocation     = function (loc)           { self.location = loc; };
	self.setPassword     = function (pass)          { self.password = hashlib.md5(pass); };
	self.addItem         = function (item)          { self.inventory.push(item); };
	self.removeItem      = function (item)          { self.inventory = self.inventory.filter(function (i) { return item !== i; }); };
	self.setInventory    = function (inv)           { self.inventory = inv; };
	self.setInCombat     = function (combat)        { self.in_combat = combat; };
	/**#@-*/

	/**
	 * "equip" an item
	 * @param string wear_location The location this item is worn
	 * @param Item   item
	 */
	self.equip = function (wear_location, item)
	{
		self.equipment[wear_location] = item.getUuid();
		item.setEquipped(true);
	};

	/**
	 * "unequip" an item
	 * @param Item   item
	 */
	self.unequip = function (item)
	{
		item.setEquipped(false);
		for (var i in self.equipment) {
			if (self.equipment[i] === item.getUuid()) {
				delete self.equipment[i];
				break;
			}
		}
		item.emit('remove', self);
	};

	/**
	 * Write to a player's socket
	 * @param string data Stuff to write
	 */
	self.write = function (data, color) {
		color = color || true;
		if (!color) ansi.disable();
		socket.write(ansi.parse(data));
		ansi.enable();
	};

	/**
	 * Write based on player's locale
	 * @param Localize l10n
	 * @param string   key
	 * @param ...
	 */
	self.writeL10n = function (l10n, key)
	{
		var locale = l10n.locale;
		if (self.getLocale()) {
			l10n.setLocale(self.getLocale());
		}

		self.write(l10n.translate.apply(null, [].slice.call(arguments).slice(1)));

		if (locale) l10n.setLocale(locale);
	};

	/**
	 * write() + newline
	 * @see self.write
	 */
	self.say = function (data, color) {
		color = color || true;
		if (!color) ansi.disable();
		socket.write(ansi.parse(data) + "\n");
		ansi.enable();
	};

	/**
	 * writeL10n() + newline
	 * @see self.writeL10n
	 */
	self.sayL10n = function (l10n, key)
	{
		var locale = l10n.locale;
		if (self.getLocale()) {
			l10n.setLocale(self.getLocale());
		}

		self.say(l10n.translate.apply(null, [].slice.call(arguments).slice(1)));
		if (locale) l10n.setLocale(locale);
	};

	/**
	 * Display the configured prompt to the player
	 */
	self.prompt = function () {
		self.write("\n" + self.getPromptString());
	};


	/**
	 * Not really a "load" as much as a constructor but we really need any
	 * of this stuff when we create a player, so make a separate method for it
	 * @param object data Object should have all the things a player needs. Like spinach.
	 */
	self.load = function (data)
	{
		self.name     = data.name;
		self.location = data.location;
		self.locale   = data.locale;
		self.prompt_string = data.prompt_string;
		self.password = data.password;
		self.inventory = data.inventory || [];
		self.equipment = data.equipment || {};
	};

	/**
	 * Save the player... who'da thunk it.
	 * @param function callback
	 */
	self.save = function (callback)
	{
		Data.savePlayer(self, callback);
	};

	/**
	 * Turn the player into a JSON string for storage
	 * @return string
	 */
	self.stringify = function ()
	{
		var inv = [];
		self.getInventory().forEach(function (item) {
			inv.push(item.flatten());
		});
		return JSON.stringify({
			name: self.name,
			location: self.location,
			locale: self.locale,
			prompt_string: self.prompt_string,
			password: self.password,
			inventory: inv,
			equipment: self.equipment
		});
	};
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;
