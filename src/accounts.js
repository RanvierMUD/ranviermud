const crypto = require('crypto');

const Accounts = function() {
  this.accounts = [];
};

const Account = function() {

  this.username   = '';
  this.characters = [];
  this.password   = null;
  this.karma      = 0;
  this.score = {
    totalKarma: 0,
  };

  /* Mutators */
  this.getUsername  = ()   => this.username;
  this.setUsername  = name => this.username = name;

  this.addCharacter = char => this.characters.push(char);
  this.getCharacter = name => this.characters.find(
    char => name.toLowerCase() === char.getName().toLowerCase());

  this.getPassword = ()   => this.password; // Returns hash.
  this.setPassword = pass =>
    this.password  = crypto
      .createHash('md5')
      .update(pass)
      .digest('hex');

  this.getKarma    = ()    => this.karma;
  this.deductKarma = karma => this.karma -= karma;
  this.addKarma    = karma => {
    this.karma += karma;
    this.score.totalKarma += karma;
  };

  this.getScore = key => key ? this.score[key] : this.score;

  return this;
};

module.exports = { Accounts, Account };
