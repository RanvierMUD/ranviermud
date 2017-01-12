'use strict';

const Data = require('./Data');
const Account = require('./Account');

class AccountManager {
  constructor() {
    this.accounts = new Map();
  }

  addAccount(acc) {
    this.accounts.set(acc.username, acc);
  }

  getAccount(username) {
    return this.accounts.get(username);
  }

  loadAccount(username, force) {
    if (this.accounts.has(username) && !force) {
      return this.getAccount(username);
    }

    if (!Data.exists('account', username)) {
      throw new Error(`Account [${username}] doesn't exist`);
    }

    const data = Data.load('account', username);

    let account = new Account(data);
    this.addAccount(account);

    return account;
  }

  findByName(name) {
    return Array.from(this.accounts.values()).find(
      acc => acc.getUsername().toLowerCase() === name.toLowerCase()
    );
  }

}

module.exports = AccountManager;
