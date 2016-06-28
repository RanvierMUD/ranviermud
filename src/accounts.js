const crypto = require('crypto');
const uuid   = require('node-uuid');


const Accounts = function() {
  this.accounts = [];
};

const Account = function() {

  this.username   = '';
  this.characters = [];
  this.password   = null;
  this.karma      = 0;
  this.uid        = null;
  this.score = {
    totalKarma: 0,
  };

  /* Mutators */
  this.getUsername  = ()   => this.username;
  this.setUsername  = name => this.username = name;

  this.setUuid = uid => this.uid = uid;
  this.getUuid = ()  => this.uid;

  this.addCharacter  = char => this.characters.push(char);
  this.getCharacters = ()   => this.characters;
  this.getCharacter  = uid  => this.characters.find(
    char => uid === char.getUuid());

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

  this.load = () => {
    this.setUuid(uuid.v4());
  }

  return this;
};

module.exports = { Accounts, Account };
