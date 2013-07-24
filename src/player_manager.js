var PlayerManager = function ()
{
	var self = this;
	self.players = [];
	// this is the default vnum
	self.default_location = 1;

	/**
	 * Get the default location for a player (this is used when they are first created)
	 * @return int
	 */
	self.getDefaultLocation = function ()
	{
		return self.default_location;
	};

	/**
	 * Get rid of a player
	 * @param Player player
	 * @param bool   killsock Whether or not to kill their socket
	 */
	self.removePlayer = function (player, killsocket)
	{
		killsocket = killsocket || false;
		if (killsocket || false) {
			player.getSocket().end();
		}

		self.players = self.players.filter(function (element) { return element !== player; });
	};

	/**
	 * Add a player
	 */
	self.addPlayer = function (player)
	{
		self.players.push(player);
	};

	/**
	 * Array.prototype.every proxy
	 * @param Callback callback
	 */
	self.every = function (callback)
	{
		self.players.every(callback);
	};

	/**
	 * Execute a function on all players
	 * @param Callback callback
	 */
	self.each = function (callback)
	{
		self.players.forEach(callback);
	};

	/**
	 * Execute a function on all players
	 * @param Callback callback
	 */
	self.some = function (callback)
	{
		return self.players.some(callback);
	};

	/**
	 * Execute a function on all players except one
	 * @param Player   player
	 * @param Callback callback
	 */
	self.eachExcept = function (player, callback)
	{
		self.players.forEach(function (p)
		{
			if (p === player) return;
			callback(p);
		});
	};

	/**
	 * Execute a function on all players except those that fail the condition
	 * @param Callback callback
	 */
	self.eachIf = function (condition, callback)
	{
		self.players.forEach(function (p)
		{
			if (!condition(p)) return;
			callback(p);
		});
	};

	/**
	 * Execute a function on all players in a certain location
	 * @param int      location
	 * @param Callback callback
	 */
	self.eachAt = function (location, callback)
	{
		self.eachIf(function (p) { return p.getLocation() === location; }, callback);
	};


	/**
	 * Broadcast a message to every player
	 * @param string message
	 */
	self.broadcast = function (message)
	{
		self.each(function (p)
		{
			p.say("\n" + message);
		});
	};

	/**
	 * Broadcast a message localized to the individual player's locale
	 * @param Localize l10n
	 * @param string   key
	 * @param ...
	 */
	self.broadcastL10n = function (l10n, key)
	{
		var locale = l10n.locale;
		var args = [].slice.call(arguments).slice(1);
		self.each(function (p)
		{
			if (p.getLocale()) {
				l10n.setLocale(p.getLocale());
			}
			p.say("\n" + l10n.translate.apply(null, args));
		});
		if (locale) l10n.setLocale(locale);
	};

	/**
	 * Broadcast a message to all but one player
	 * @param Player player
	 * @param string message
	 */
	self.broadcastExcept = function (player, message)
	{
		self.eachExcept(player, function (p)
		{
			p.say("\n" + message);
		});
	};

	/**
	 * Broadcast a message localized to the individual player's locale
	 * @param Player   player
	 * @param Localize l10n
	 * @param string   key
	 * @param ...
	 */
	self.broadcastExceptL10n = function (player, l10n, key)
	{
		var locale = l10n.locale;
		var args = [].slice.call(arguments).slice(2);
		self.eachExcept(player, function (p)
		{
			if (p.getLocale()) {
				l10n.setLocale(p.getLocale());
			}

			for (var i = 0; i < args.length; i++) {
				if (typeof args[i] === 'function') {
					args[i] = args[i](p);
				}
			}
			p.say("\n" + l10n.translate.apply(null, args));
		});
		if (locale) l10n.setLocale(locale);
	};

	/**
	 * Broadcast a message to all but one player
	 * @param string   message
	 * @param function condition
	 */
	self.broadcastIf = function (message, condition)
	{
		self.eachIf(condition, function (p)
		{
			p.say("\n" + message);
		});
	};

	/**
	 * Broadcast a message to all players in the same location as another player
	 * @param string message
	 * @param Player player
	 */
	self.broadcastAt = function (message, player)
	{
		self.eachAt(player.getLocation(), function (p)
		{
			p.say("\n" + message);
		});
	};

	/**
	 * Broadcast a message localized to the individual player's locale
	 * @param Player   player
	 * @param Localize l10n
	 * @param string   key
	 * @param ...
	 */
	self.broadcastAtL10n = function (player, l10n, key)
	{
		var locale = l10n.locale;
		var args = [].slice.call(arguments).slice(2);
		self.eachAt(player.getLocation(), function (p)
		{
			if (p.getLocale()) {
				l10n.setLocale(p.getLocale());
			}

			for (var i = 0; i < args.length; i++) {
				if (typeof args[i] === 'function') {
					args[i] = args[i](p);
				}
			}
			p.say("\n" + l10n.translate.apply(null, args));
		});
		if (locale) l10n.setLocale(locale);
	};

	/**
	 * Broadcast a message to all players in the same location as another player
	 * @param string message
	 * @param Player player
	 */
	self.broadcastAtIf = function (message, player, condition)
	{
		var list = [];
		self.eachAt(player.getLocation(), function (p)
		{
			list.push(p);
		});
		list.forEach(function (p)
		{
			if (!condition(p)) return;
			p.say("\n" + message);
		});
	};

	/**
	 * Broadcast a message localized to the individual player's locale
	 * @param Player   player
	 * @param Localize l10n
	 * @param string   key
	 * @param ...
	 */
	self.broadcastAtIfL10n = function (player, condition, l10n, key)
	{
		var locale = l10n.locale;
		var args = [].slice.call(arguments).slice(3);

		var list = [];
		self.eachAt(player.getLocation(), function (p)
		{
			list.push(p);
		});
		list.forEach(function (p)
		{
			if (p.getLocale()) {
				l10n.setLocale(p.getLocale());
			}

			if (!condition(p)) return;

			for (var i = 0; i < args.length; i++) {
				if (typeof args[i] === 'function') {
					args[i] = args[i](p);
				}
			}
			p.say("\n" + l10n.translate.apply(null, args));
		});
		if (locale) l10n.setLocale(locale);
	};

};

exports.PlayerManager = PlayerManager;
