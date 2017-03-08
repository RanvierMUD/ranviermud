'use strict';

const Party = require('./Party');

class PartyManager extends Set {
  create(leader) {
    const party = new Party(leader);
    this.add(party);
  }

  disband(party) {
    this.delete(party);
    party.disband();
    party = null;
  }
}

module.exports = PartyManager;
