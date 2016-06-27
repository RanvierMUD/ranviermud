const Accounts = function() {

};

const Account = function() {

  this.username   = '';
  this.characters = [];

  /* Mutators */
  this.getUsername  = ()   => this.username;
  this.setUsername  = name => this.username = name;

  this.addCharacter = char => this.characters.push(char);
  this.getCharacter = name => this.characters.find(
    char => name.toLowerCase() === char.getName().toLowerCase());

  return this;
};

module.exports = { Accounts, Account };
