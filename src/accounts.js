'use strict';
const crypto = require('crypto');
const util   = require('util');
const events = require('events');

const Accounts = function() {
  this.accounts = [];

  this.addAccount  = acc  => this.accounts.push(acc);
  this.getAccounts = ()   => this.accounts;
  this.getAccount  = name => this.accounts.find(
    acc => acc.getUsername().toLowerCase() === name.toLowerCase());

  return this;
};

const Account = function() {

  this.username   = '';
  this.characters = [];
  this.password   = null;
  this.karma      = 0;
  this.uid        = null;
  this.socket     = null;
  this.deceased   = [];

  this.score = {
    totalKarma:    0,
    totalKills:    0,
    totalExplored: 0,
    totalLevels:   0,
    grandTotal:    0,
  };

  /* Mutators */

  this.getSocket    = ()   => this.socket;
  this.setSocket    = sock => this.socket = sock;

  this.getUsername  = ()   => this.username;
  this.setUsername  = name => this.username = name;

  this.addCharacter  = name  => this.characters.push(name);
  this.getCharacters = ()    => this.characters;
  this.getCharacter  = name  => this.characters.find(
    char => name === char);
  this.getDeceased   = ()    => this.deceased;


  this.loadCharacters = ()   => this.characters
    .map(char => Data.loadPlayer(char));

  this.loadCharacter  = name => Data
    .loadPlayer(this.characters
      .find(char => char === name));


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

  // Convert char score to karma upon death and add to karma.
  this.updateScore = () => {
    const sumScore = score =>
      (sum, char) => char[score].length ? sum + char[score].length : sum;

    const chars = this.loadCharacters();

    this.score.totalKilled   = chars
      .reduce(sumScore('killed'), 0);

    this.score.totalExplored = chars
      .reduce(sumScore('explored'), 0);

    this.score.totalLevels   = chars
      .reduce((sum, char) => sum + char.level, 0);

    const sumGT = obj => {
      const scoring = {
        'Killed':   n => Math.round(n / 50),
        'Explored': n => Math.round(n / 40),
        'Levels':   n => Math.round(n / 5),
        'Karma':    n => n,
      };

      let points = 0;
      for (const conversion in scoring) {
        const converter = scoring[conversion];
        const total     = 'total' + conversion;
        const amount    = this.score[total];

        points += converter(amount);
      }
      return points;
    };

    this.score.grandTotal = sumGT(this.score);
  };

  this.stringify = () => {
    const accountData = {
      username:   this.username,
      characters: this.characters,
      password:   this.password,
      karma:      this.karma,
      uid:        this.uid,
      score:      this.score,
    };

    return JSON.stringify(accountData);
  }

  this.save = () => Data.saveAccount(this);

  //TODO: Use this in the accountmanager when loading all accounts
  this.load = data => {
    this.username   = data.username;
    this.characters = data.characters;
    this.password   = data.password;
    this.karma      = data.karma;
    this.uid        = data.uid;
    this.score      = data.score;
  };

  return this;
};

util.inherits(Account, events.EventEmitter);

module.exports = { Accounts, Account };
