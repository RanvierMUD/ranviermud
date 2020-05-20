const playerData = require("../../../playerFixtures/tom.json");
const CombatTuple = require("../CombatTuple");
const { generatePlayer } = require("../../__tests__/helperFns");

describe("CombatTuple", () => {
  const hasAttribute = jest.fn();
  const getAttribute = () => 10;
  const playerTwo = {
    ...playerData,
    name: "Saruman",
    lastDir: "east",
    hasAttribute,
    combatData: {},
    getAttribute,
  };
  const playerOne = {
    ...playerData,
    name: "Tom Bombadil",
    lastDir: "east",
    combatants: [playerTwo],
    combatData: {},
    hasAttribute,
    getAttribute,
  };

  it("Creates a tuple with the characters you insert", () => {
    const tuple = new CombatTuple(playerOne, playerTwo);

    expect(tuple.characters).toEqual([playerOne, playerTwo]);
  });
  it("Can find if two combatants have a tuple already going", () => {
    new CombatTuple(playerOne, playerTwo);

    expect(CombatTuple.hasTuple(playerOne, playerTwo)).toBeTruthy();
  });
  it("Returns a tuple for two specific characters", () => {
    const tuple = new CombatTuple(playerOne, playerTwo);

    expect(CombatTuple.getTuple(playerOne, playerTwo)).toEqual(tuple);
  });
  it("Returns false if those characters do not have a tuple", () => {
    expect(CombatTuple.getTuple(playerOne, generatePlayer())).toBeFalsy();
  });
});
