const expect = require('chai').expect;

const Accounts = require('../../src/accounts').Accounts;
const Account  = require('../../src/accounts').Account;

describe('Accounts Manager', () => {
  it('should exist', () => {
    expect(Accounts).to.be.ok;
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

    it('should be able to add and return characters', () => {
      const expected = { getName: () => 'Hooray'};
      testAccount.addCharacter(expected);
      const actual = testAccount.getCharacter('Hooray');
      expect(actual).to.eql(expected);
    });

  });

  describe('Karma', () => {

    const testAccount = new Account();

    it('should be able to add and get karma', () => {
      const expected = 6;
      testAccount.addKarma(expected);
      expect(testAccount.getKarma()).to.equal(expected);
    });

    it('should be able to deduct and get karma', () => {
      const expected = 3;
      testAccount.deductKarma(expected);
      expect(testAccount.getKarma()).to.equal(expected);
    });

    describe('Scoring', () => {

      it('should be able to get a cumulative total of all karma earned', () => {
        const expected = 12;
        testAccount.addKarma(6);
        expect(testAccount.getScore('totalKarma')).to.equal(expected);
      });

    })

  });

});
