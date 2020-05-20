"use strict";

const { Random } = require("rando-js");

/**
 * Manages perception checks in an engagement
 */
class Perception {
  /**
   * Iterates through all tuples in an engagement and checks if the users have
   * awareness.
   * @param {Engagement} engagement The current engagement
   */
  static perceptionCheck(engagement) {
    const tuples = engagement.getTuples;
    if (!tuples.length) return false;
    for (const duo of tuples) {
      Perception.evaluateDuo(duo);
    }
  }

  /**
   * Compares each user's perception rolls using their action modifiers,
   * then emits the event if necessary.
   * @param {CombatTuple} duo A pair of fighters joined in combat
   */
  static evaluateDuo(duo) {
    // We'll roll a d100. This will be modified by the character's current action.
    // Having just resolved an action, like guard or probe, will yield better
    // perception results than being in the middle of something like a strike,
    // or long dodge
    for (const character of duo.characters) {
      const action = character.combatData.decision;
      let opposition, oppositeDecision;
      try {
        opposition = duo.getOpposite(character);
        oppositeDecision = opposition.combatData.decision;
      } catch (e) {
        console.log(e.message);
        throw e;
      }
      if (!oppositeDecision) {
        return;
      }
      let mod;
      if (action) {
        mod = 100 * action.config.perceptMod;
      }
      const perceptRoll = Perception.rollDice(1, mod);
      // now this percept roll must beat his opposite's action's threshold
      const oppositeThreshold = oppositeDecision.config.perceptThreshold;

      if (perceptRoll > oppositeThreshold) {
        character.emit("perceptSuccess", oppositeDecision, opposition);
      } else if (perceptRoll > oppositeThreshold * 0.5) {
        character.emit("partialPerceptSuccess", oppositeDecision, opposition);
      } else if (perceptRoll <= Math.ceil(oppositeThreshold * 0.1)) {
        character.emit("criticalPerceptFailure", opposition);
      }
    }
  }

  static rollDice(start, end) {
    return Random.inRange(start, end);
  }
}

module.exports = Perception;
