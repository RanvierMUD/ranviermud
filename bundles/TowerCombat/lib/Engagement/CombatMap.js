"use strict";

const { Random } = require("rando-js");
const { combatMapDefaults } = require("../Combat.enums");

class CombatMap {
  constructor(characters) {
    this.gridMembers = {};
    this.addCharacters(characters);
  }

  addCharacters(characters) {
    for (const character of characters) {
      this.gridMembers[character.name] = {
        character: character,
        coordinate: this.generateCoordinate(character.lastDir),
        facing: character.lastDir,
      };
    }
  }

  generateCoordinate(direction) {
    let x = combatMapDefaults[direction].x;
    let y = combatMapDefaults[direction].y;

    while (this.coordinateIsOccupied(x, y)) {
      x += Random.inRange(-1, 1);
      y += Random.inRange(-1, 1);
    }
    return {
      x,
      y,
    };
  }

  coordinateIsOccupied(x, y) {
    const members = Object.keys(this.gridMembers);
    for (const member of members) {
      const memberCoordinate = this.gridMembers[member].coordinate;
      if (memberCoordinate.x === x && memberCoordinate.y === y) {
        return true;
      }
    }
    return false;
  }
}

module.exports = CombatMap;
