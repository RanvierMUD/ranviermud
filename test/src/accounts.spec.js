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

    it('should be able to add and return characters', () => {
      const expected = {
        getUuid: () => 'Hooray',
        isAlive: true
      };
      testAccount.addCharacter(expected);
      const actual = testAccount.getCharacter('Hooray');
      expect(actual).to.eql(expected);
    });

    it('should be able to return array of all characters', () => {
      testAccount.addCharacter({ isAlive: false });
      const actual   = testAccount.getCharacters().length;
      const expected = 2;
      expect(actual).to.equal(expected);
    });

    it('should return array of all living characters', () => {
      const alive = testAccount.getLivingCharacters();
      expect(alive.length).to.equal(1);
    });

    it('should return array of all living characters', () => {
      const dead = testAccount.getDeadCharacters();
      expect(dead.length).to.equal(1);
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

      const scoreMockA = {
        'killed': [1, 2, 3],
        'explored': [1, 2],
        'level': 12
      };

      const scoreMockB = {
        'killed': [2, 2],
        'explored': [1],
        'level': 5
      };

      it('should be able to get a cumulative total of all karma earned', () => {
        const expected = 12;
        testAccount.addKarma(6);
        expect(testAccount.getScore('totalKarma')).to.equal(expected);
      });

      it('should be able to total scores', () => {
        const expected = {
          totalKarma: 12,
          totalKills: 0,
          totalExplored: 0,
          totalLevels: 0,
          grandTotal: 12,
          totalKilled: 0
        };

        testAccount.updateScore();
        expect(testAccount.getScore()).to.eql(expected);
      });

      it('should be able to update scores', () => {
        const expected = {
          totalKarma: 12,
          totalKills: 0,
          totalExplored: 3,
          totalLevels: 17,
          grandTotal: 15,
          totalKilled: 5
        };

        testAccount.addCharacter(scoreMockA);
        testAccount.addCharacter(scoreMockB);

        testAccount.updateScore();
        const actual = testAccount.getScore();

        expect(actual).to.eql(expected)
      });


    })

  });

});
