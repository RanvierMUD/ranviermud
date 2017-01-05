'use strict';
const crypto = require('crypto');
const EventEmitter = require('events');

const Data   = require('./data').Data;

class Accounts {
  constructor() {
    this.accounts = [];
  }

  find(filter) {
    return this.accounts.find(filter)
  }

  addAccount(acc) {
    this.accounts.push(acc);
  }

  getAccounts() {
    return this.accounts;
  }

  getAccount(name) {
    return this.accounts.find(
      acc => acc.getUsername().toLowerCase() === name.toLowerCase()
    );
  }
}

class Account extends EventEmitter {

  constructor () {
    super();
    this.username   = '';
    this.characters = [];
    this.password   = null;
    this.uid        = null;
    this.socket     = null;
  }

  /* Mutators */

  getSocket() {
    return this.socket;
  }
  setSocket(sock) {
    this.socket = sock;
  }

  getUsername() {
    return this.username;
  }
  setUsername(name) {
    this.username = name;
  }

  addCharacter(name) {
    this.characters.push(name);
  }
  getCharacters() {
    return this.characters;
  }
  getCharacter(name) {
    return this.characters.find(char => name === char);
  }

  loadCharacters() {
    return this.characters.map(char => Data.loadPlayer(char));
  }

  loadCharacter(name) {
    return Data.loadPlayer(this.characters.find(char => char === name));
  }

  getPassword() {
    return this.password;
  }
  setPassword(pass) {
    this.password = this._hashPassword(pass);
  }
  _hashPassword(pass) {
    return crypto
      .createHash('md5')
      .update(pass)
      .digest('hex');
  }

  stringify() {
    const accountData = {
      username:   this.username,
      characters: this.characters,
      password:   this.password,
      uid:        this.uid,
    };

    return JSON.stringify(accountData);
  }

  save() {
    return Data.saveAccount(this);
  }

  load(data) {
    this.username   = data.username;
    this.characters = data.characters;
    this.password   = data.password;
    this.uid        = data.uid;
  }
}

module.exports = { Accounts, Account };
