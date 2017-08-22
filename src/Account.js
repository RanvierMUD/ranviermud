'use strict';
const bcrypt = require('bcryptjs');
const Data   = require('./Data');
const Config  = require('./Config');

/**
 * Representation of a player's account
 *
 * @property {string} username
 * @property {Array<string>} characters List of character names in this account
 * @property {string} password Hashed password
 * @property {boolean} banned Whether this account is banned or not
 */
class Account {

  /**
   * @param {Object} data Account save data
   */
  constructor(data) {
    this.username   = data.username;
    this.characters = data.characters || [];
    this.password   = data.password;
    this.banned = data.banned || false;
  }

  /**
   * @return {string}
   */
  getUsername() {
    return this.username;
  }

  /**
   * @param {string} username
   */
  addCharacter(username) {
    this.characters.push(username);
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  hasCharacter(name) {
    return this.characters.indexOf(name) !== -1;
  }

  /**
   * @param {string} password Unhashed password. Is hashed inside this function
   */
  setPassword(pass) {
    this.password = this._hashPassword(pass);
    this.save();
  }

  /**
   * @param {string} pass Unhashed password to check against account's password
   * @return {boolean}
   */
  checkPassword(pass) {
    return bcrypt.compareSync(pass, this.password);
  }

  /**
   * @param {function} callback after-save callback
   */
  save(callback) {
    Data.save('account', this.username, this, callback);
  }

  /**
   * Set this account to banned
    There is no unban because this can just be done by manually editing the account file
   */
  ban() {
    this.banned = true;
    this.save();
  }

  /**
   * @private
   * @param {string} pass
   * @return {string} Hashed password
   */
  _hashPassword(pass) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(pass, salt);
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
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

  /**
   * Gather data from account object that will be persisted to disk
   *
   * @return {Object}
   */
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
