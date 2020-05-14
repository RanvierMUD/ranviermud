"use strict";

const CombatErrors = require("./CombatErrors");
const CombatTuple = require("./CombatTuple");

/**
 * Engagement tracks the relationships between two characters.
 * An engagement should be created for every character in the same battle. Each
 * engagement tracks relative position, and will manage primary targets
 * Primary and secondary are only
 */
class Engagement {
  constructor(character) {
    this.tuples = [];
    this.initializeEngagement(character);
  }
  /**
   * This should create all the necessary tuples and map for the engagement
   * @param {Character} character primary character
   */
  initializeEngagement(character) {
    let target = null;
    try {
      target = Engagement.chooseCombatant(character);
    } catch (e) {
      character.removeFromCombat();
      character.combatData = {};
      throw e;
    }
    this.generateTuples(character, character.combatants);
    this.target = target;
  }

  /**
   * This should generate a tuple set for every fighter in combat
   * @param {Character} character The current character
   * @param {Array} combatants Array of combatants he's in combat with
   */
  generateTuples(character, combatants) {
    if (!combatants.length) null;
    const allCombatants = [character, ...combatants];
    for (let i = 0; i < allCombatants.length; i++) {
      for (let j = 1; j < allCombatants.length; j++) {
        const combatant = allCombatants[i];
        const combatantTwo = allCombatants[j];
        if (!CombatTuple.hasTuple(combatant, combatantTwo)) {
          const combatTuple = new CombatTuple(combatant, combatantTwo);
          this.tuples = [...this.tuples, combatTuple];
        }
      }
    }
  }
  /**
   * Find a target for a given attacker
   * @param {Character} attacker
   * @return {Character|null}
   */
  static chooseCombatant(attacker) {
    if (!attacker.combatants.size) {
      return null;
    }

    for (const target of attacker.combatants) {
      if (!target.hasAttribute("health")) {
        throw new CombatErrors.CombatInvalidTargetError();
      }
      if (target.getAttribute("health") > 0) {
        return target;
      }
    }

    return null;
  }

  /**
   * @param {Character} attacker
   * @param {Character} target
   */
  static getEngagement(character) {
    if (character.combatData.engagemet) {
      return character.combatData.engagement;
    }
    character.combatData.engagement = new Engagement(character);
    return character.combatData.engagement;
  }
}

module.exports = Engagement;
