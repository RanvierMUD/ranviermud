const range = {
  MID: "MID",
  CLOSE: "CLOSE",
  LONG: "LONG",
  OUT: "OUT",
};

const clockPosition = {
  FRONT: "FRONT",
  12: "FRONT",
  RIGHT: "RIGHT",
  3: "RIGHT",
  LEFT: "LEFT",
  9: "LEFT",
  BEHIND: "BEHIND",
  6: "BEHIND",
  FRONTRIGHT: "FRONTRIGHT",
  1: "FRONTRIGHT",
  2: "FRONTRIGHT",
  BACKLEFT: "BACKLEFT",
  4: "BACKLEFT",
  5: "BACKLEFT",
  BACKRIGHT: "BACKRIGHT",
  7: "BACKRIGHT",
  8: "BACKRIGHT",
  FRONTLEFT: "FRONTLEFT",
  10: "FRONTLEFT",
  11: "FRONTLEFT",
};

class CombatTuple {
  constructor(primary, secondary) {
    this.primary = primary;
    this.secondary = secondary;
    this.primaryToSecondaryFacing = clockPosition.FRONT;
    this.secondaryToPrimaryFacing = clockPosition.FRONT;
    this.range = range.LONG;
    if (!primary.combatData.tuples) primary.combatData.tuples = [];
    if (!secondary.combatData.tuples) secondary.combatData.tuples = [];
    primary.combatData.tuples = [...primary.combatData.tuples, this];
    secondary.combatData.tuples = [...secondary.combatData.tuples, this];
  }
  /**
   * @return {Array} Array of characters in this tuple
   */
  get characters() {
    return [this.primary, this.secondary];
  }
  /**
   * @return {Character} Other charcacter in this array
   */
  getOpposite(character) {
    if (this.characterIsInTuple(character)) {
      return [this.primary, this.secondary].find(
        (member) => member !== character
      );
    }
    throw new Error("Character not found in tuple");
  }

  /**
   * Returns this character's relative position
   * @param {Character} character
   */

  characterIsInTuple(character) {
    return this.primary === character || this.secondary === character;
  }

  charactersAreInTuple(character, characterTwo) {
    return (
      this.characterIsInTuple(character) &&
      this.characterIsInTuple(characterTwo)
    );
  }

  static hasTuple(primary, secondary) {
    if (!primary.combatData.tuples) return false;
    for (const tuple of primary.combatData.tuples) {
      if (tuple.charactersAreInTuple(primary, secondary)) {
        return true;
      }
    }
    return false;
  }

  static getTuple(primary, secondary) {
    for (const tuple of primary.combatData.tuples) {
      if (tuple.charactersAreInTuple(primary, secondary)) {
        return tuple;
      }
    }
    return false;
  }
}

module.exports = CombatTuple;
