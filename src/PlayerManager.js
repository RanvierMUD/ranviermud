'use strict';

const EventEmitter = require('events');
const Data = require('./Data');
const Player = require('./Player');

class PlayerManager extends EventEmitter {
  constructor() {
    super();
    this.players = new Map();
    this.on('save', this.saveAll);
  }

  getPlayer(name) {
    return this.players.get(name);
  }

  addPlayer(player) {
    this.players.set(player.name, player);
  }

  removePlayer(player, killSocket) {
    if (killSocket) {
      player.socket.end();
    }

    this.players.delete(player.name);
  }

  filter(fn) {
    return Array.from(this.players.values()).filter(fn);
  }

  loadPlayer(account, username, force) {
    if (this.players.has(username) && !force) {
      return this.getPlayer(username);
    }

    const data = Data.load('player', username);
    data.name = username;

    let player = new Player(data);
    player.account = account;

    // TODO: Load scripts

    this.addPlayer(player);
    return player;
  }

  exists(name) {
    return Data.exists('player', name);
  }

  saveAll(playerCallback) {
    for (const [ name, player] of this.players.entries()) {
      player.emit('save', playerCallback);
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
