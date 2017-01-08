//TODO: LOL REFACTOR

var PlayerManager = function ()
{
  var self = this;
  self.players = [];
  // this is the default vnum
  self.defaultLocation = 1;

  /**
   * Get the default location for a player (this is used when they are first created)
   * @return int
   */
  self.getDefaultLocation = function ()
  {
    return self.defaultLocation;
  };

  self.getByName = function(name) {
    return self.players.find(p => p.getName() === name);
  }

  /**
   * Get rid of a player
   * @param Player player
   * @param bool   killsock Whether or not to kill their socket
   */
  self.removePlayer = function (player, killsocket)
  {
    if (killsocket) {
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
    return self.players.every(callback);
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
   * Return true if any players meet the condition.
   * @param Condition condition
   */
  self.some = function (condition)
  {
    return self.players.some(condition);
  };

  /* Proxy array.find */
  self.find = self.players.find;

  /**
   * Return array of players who meet the condition
   * @param condition
   * @return [players]
   */
   self.filter = self.players.filter;

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
      p.say("\r\n" + message);
    });
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
      p.say("\r\n" + message);
    });
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
      p.say("\r\n" + message);
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
      p.say("\r\n" + message);
    });
  };
};

exports.PlayerManager = PlayerManager;
