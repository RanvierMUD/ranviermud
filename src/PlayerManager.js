'use strict';

const EventEmitter = require('events');
const Data = require('./Data');
const Player = require('./Player');
const EventManager = require('./EventManager');

class PlayerManager extends EventEmitter {
  constructor() {
    super();
    this.players = new Map();
    this.events = new EventManager();
    this.on('save', this.saveAll);
    this.on('effectTick', this.tickAll);
  }

  getPlayer(name) {
    return this.players.get(name);
  }

  addPlayer(player) {
    this.players.set(this.keyify(player), player);
  }

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

  keyify(player) {
    return player.name.toLowerCase();
  }

  exists(name) {
    return Data.exists('player', name);
  }

  saveAll(playerCallback) {
    for (const [ name, player ] of this.players.entries()) {
      player.emit('save', playerCallback);
    }
  }

  tickAll(playerCallback) {
    for (const [ name, player ] of this.players.entries()) {
      player.emit('effectTick');
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
