'use strict';
const bcrypt = require('bcryptjs');
const Data   = require('./Data');
const Config  = require('./Config');

class Account {

  constructor(data) {
    this.username   = data.username;
    this.characters = data.characters || [];
    this.password   = data.password;
  }

  getUsername() {
    return this.username;
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
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(pass, salt);
  }

  save(callback) {
    Data.save('account', this.username, this, callback);
  }

  static validateName(name) {
    const maxLength = Config.get('maxAccountNameLength');
    const minLength = Config.get('minAccountNameLength');

    if (!name) {
      return 'Please enter a name.';
    }
    if (name.length > maxLength) {
      return 'Too long, try a shorter name.';
    }
    if (name.length < minLength) {
      return 'Too short, try a longer name.';
    }
    if (!/^[a-z]+$/i.test(name)) {
      return 'Your name may only contain A-Z without spaces or special characters.';
    }
    return false;
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
