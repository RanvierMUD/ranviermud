const Accounts = function() {

};

const Account = function() {

  this.username = '';

  /* Mutators */
  this.getUsername = ()   => this.username;
  this.setUsername = name => this.username = name;

  return this;
};

module.exports = { Accounts, Account };
