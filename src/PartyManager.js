'use strict';

const Party = require('./Party');

/**
 * Keeps track of active in game parties and is used to create new parties
 * @extends Set
 */
class PartyManager extends Set {
  /**
   * Create a new party from with a given leader
   * @param {Player} leader
   */
  create(leader) {
    const party = new Party(leader);
    this.add(party);
  }

  /**
   * @param {Party} party
   */
  disband(party) {
    this.delete(party);
    party.disband();
    party = null;
  }
}

module.exports = PartyManager;
