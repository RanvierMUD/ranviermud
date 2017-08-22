'use strict';

const EventEmitter = require('events');
const Data = require('./Data');
const Player = require('./Player');
const EventManager = require('./EventManager');

/**
 * Keeps track of all active players in game
 * @extends EventEmitter
 * @property {Map} players
 * @property {EventManager} events Player events
 * @listens PlayerManager#save
 * @listens PlayerManager#updateTick
 * @implements Broadcastable
 */
class PlayerManager extends EventEmitter {
  constructor() {
    super();
    this.players = new Map();
    this.events = new EventManager();
    this.on('save', this.saveAll);
    this.on('updateTick', this.tickAll);
  }

  /**
   * @param {string} name
   * @return {Player}
   */
  getPlayer(name) {
    return this.players.get(name.toLowerCase());
  }

  /**
   * @param {Player} player
   */
  addPlayer(player) {
    this.players.set(this.keyify(player), player);
  }

  /**
   * @param {Player} player
   * @param {boolean} killSocket true to also force close the player's socket
   */
  removePlayer(player, killSocket) {
    if (killSocket) {
      player.socket.end();
    }

    this.players.delete(this.keyify(player));
  }

  /**
   * @return {array}
   */
  getPlayersAsArray() {
    return Array.from(this.players.values());
  }

  /**
   * @param {string}   behaviorName
   * @param {Function} listener
   */
  addListener(event, listener) {
    this.events.add(event, listener);
  }

  /**
   * @param {Function} fn Filter function
   * @return {array}
   */
  filter(fn) {
    return this.getPlayersAsArray().filter(fn);
  }

  /**
   * Load a player for an account
   * @param {GameState} state
   * @param {Account} account
   * @param {string} username
   * @param {boolean} force true to force reload from storage
   * @return {Player}
   */
  loadPlayer(state, account, username, force) {
    if (this.players.has(username) && !force) {
      return this.getPlayer(username);
    }

    const data = Data.load('player', username);
    data.name = username;

    let player = new Player(data);
    player.account = account;

    // TODO: Load scripts
    this.events.attach(player);

    this.addPlayer(player);
    return player;
  }

  /**
   * Turn player into a key used by this class's map
   * @param {Player} player
   * @return {string}
   */
  keyify(player) {
    return player.name.toLowerCase();
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  exists(name) {
    return Data.exists('player', name);
  }

  /**
   * @param {function} playerCallback callback after save of each player
   * @fires Player#save
   */
  saveAll(playerCallback) {
    for (const [ name, player ] of this.players.entries()) {
      /**
       * @event Player#save
       * @param {function} playerCallback
       */
      player.emit('save', playerCallback);
    }
  }

  /**
   * @fires Player#updateTick
   */
  tickAll() {
    for (const [ name, player ] of this.players.entries()) {
      /**
       * @event Player#updateTick
       */
      player.emit('updateTick');
    }
  }

  /**
   * Used by Broadcaster
   * @return {Array<Character>}
   */
  getBroadcastTargets() {
    return this.players;
  }
}

module.exports = PlayerManager;
