const expect = require('chai').expect;

const Accounts = require('../../src/accounts').Accounts;
const Account  = require('../../src/accounts').Account;

describe('Accounts Manager', () => {
  it('should exist', () => {
    expect(Accounts).to.be.ok;
  });

  describe('Getting Accounts', () => {
    const Manager = new Accounts();

    it('should be able to add and get new accounts', () => {
      const expected = { getUsername: () => 'lol' };
      Manager.addAccount(expected);
      expect(Manager.getAccount('lol')).to.eql(expected);
    });

    it('should be able to get all accounts', () => {
      Manager.addAccount({ getUsername: () => 'hah' });
      expect(Manager.getAccounts().length).to.equal(2);
    })

  });

});

describe('User Account', () => {
  it('should exist', () => {
    expect(Accounts).to.be.ok;
  });

  it('should be instantiated by new', () => {
    const testAccount = new Account();
    expect(testAccount instanceof Account).to.be.true;
  });

  describe('Usernames', () => {

    const testAccount = new Account();

    it('should be able to set and get username', () => {
      const name = 'Hats';
      testAccount.setUsername(name);
      expect(testAccount.getUsername()).to.equal(name);
    });

  });

  describe('Character Management', () => {

    const testAccount = new Account();

    it('should be able to add and get characters by name', () => {
      const expected = 'Hooray';
      testAccount.addCharacter('Hooray');
      const actual = testAccount.getCharacter('Hooray');
      expect(actual).to.eql(expected);
    });

    it('should be able to return array of all characters', () => {
      testAccount.addCharacter('Potato');
      const actual   = testAccount.getCharacters().length;
      const expected = 2;
      expect(actual).to.equal(expected);
    });
  });
});
