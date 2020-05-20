"use strict";

const CombatErrors = require("../CombatErrors");
const CombatTuple = require("./CombatTuple");
const Guard = require("../intraRoundCommitments/Guard");
const {
  CommandParser,
} = require("../../../bundle-example-lib/lib/CommandParser");

/**
 * Engagement tracks the relationships between two characters.
 * An engagement should be created for every character in the same battle. Each
 * engagement tracks relative position, and will manage primary targets
 * Primary and secondary are only
 */
class Engagement {
  constructor(character) {
    this.lag = 0;
    this.timeOfPulse = Date.now();
    this.tuples = [];
    this.characterList = new Set();
    this.initializeEngagement(character);
  }
  /**
   * This should create all the necessary tuples and map for the engagement
   * @param {Character} character primary character
   */
  initializeEngagement(character) {
    this.generateTuples(character, character.combatants);
    this.assignEngagementTo([character, ...character.combatants]);
    this.createMainPairings();
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

  assignEngagementTo(characterArray) {
    this.characterList = characterArray;
    if (characterArray.length) {
      for (const character of characterArray) {
        character.combatData.engagement = this;
      }
    }
  }

  createMainPairings() {
    for (const tuple of this.tuples) {
      const { primary, secondary } = tuple;
      if (!primary.combatData.target) {
        primary.combatData.target = secondary;
      }
      if (!secondary.combatData.target) {
        secondary.combatData.target = primary;
      }
    }
  }

  applyDefaults(state) {
    for (const character of this.characterList) {
      if (!character.combatData.decision) {
        const { target } = character.combatData;
        CommandParser.parse(state, "guard", character);
        character.combatData.decision = new Guard(character, target);
      }
    }
  }

  completionCheck() {
    if (this.tuples.length < 1) {
      for (const character of this.characterList) {
        character.removeFromCombat();
      }
    }
  }

  reduceLag() {
    const change = Date.now() - this.timeOfPulse;
    this.lag -= change;
    this.timeOfPulse = Date.now();
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
    if (character.combatData.engagement) {
      return character.combatData.engagement;
    }
    character.combatData.engagement = new Engagement(character);
    return character.combatData.engagement;
  }

  get characters() {
    return this.characterList;
  }

  get getTuples() {
    return this.tuples;
  }

  get lagIsComplete() {
    return this.lag < 0;
  }
}

module.exports = Engagement;
