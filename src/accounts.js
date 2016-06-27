const crypto = require('crypto');

const Accounts = function() {

};

const Account = function() {

  this.username   = '';
  this.characters = [];
  this.password   = null;

  /* Mutators */
  this.getUsername  = ()   => this.username;
  this.setUsername  = name => this.username = name;

  this.getPassword = () => this.password; // Returns hash.
  this.setPassword = pass =>
    this.password = crypto
      .createHash('md5')
      .update(pass)
      .digest('hex');

  this.addCharacter = char => this.characters.push(char);
  this.getCharacter = name => this.characters.find(
    char => name.toLowerCase() === char.getName().toLowerCase());

  return this;
};

module.exports = { Accounts, Account };
