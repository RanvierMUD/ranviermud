'use strict';

/**
 * Representation of an adventuring party
 */
class Party extends Set {
  constructor(leader) {
    super();
    this.invited = new Set();
    this.leader = leader;
    this.add(leader);
  }

  delete(member) {
    super.delete(member);
    member.party = null;
  }

  add(member) {
    super.add(member);
    member.party = this;
    this.invited.delete(member);
  }

  disband() {
    for (const member of this) {
      this.delete(member);
    }
  }

  invite(target) {
    this.invited.add(target);
  }

  isInvited(target) {
    return this.invited.has(target);
  }

  removeInvite(target) {
    this.invited.delete(target);
  }

  getBroadcastTargets() {
    return [...this];
  }
}

module.exports = Party;
