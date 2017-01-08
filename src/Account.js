'use strict';
const crypto = require('crypto');
const Data = require('./Data');

class Account {

  constructor(data) {
    this.username   = data.username;
    this.characters = data.characters || [];
    this.password   = data.password;
  }

  addCharacter(username) {
    this.characters.push(username);
  }

  hasCharacter(name) {
    return this.characters.indexOf(name) !== -1;
  }

  setPassword(pass) {
    this.password = this._hashPassword(pass);
  }

  _hashPassword(pass) {
    return crypto.createHash('md5').update(pass).digest('hex');
  }

  save(callback) {
    Data.save('account', this.username, this, callback);
  }

  serialize() {
    const {
      username,
      characters,
      password,
    } = this;

    return {
      username,
      characters,
      password
    };
  }
}

module.exports = Account;
